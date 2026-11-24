import { useEffect, useState } from "react";
import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import { Alert, Snackbar } from "@mui/material";
import { BellOff, BellRing } from "lucide-react";
import {
  RegisterPushInstallationApi,
  UnregisterPushInstallationApi,
  GetUserPreferenceApi,
  SetUserPreferenceApi,
} from "../../utils/Api";
import "./NotificationToggle.scss";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const installationStorageKey = "career-connect-push-installation";

function getStoredInstallation(token) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(installationStorageKey) ?? "null");
    return stored?.token === token && typeof stored.installationId === "string"
      ? stored.installationId
      : "";
  } catch {
    return "";
  }
}

function storeInstallation(token, installationId) {
  sessionStorage.setItem(installationStorageKey, JSON.stringify({ token, installationId }));
}

function clearStoredInstallation(token) {
  if (getStoredInstallation(token)) {
    sessionStorage.removeItem(installationStorageKey);
  }
}

export async function UnregisterStoredPushInstallation(token) {
  const installationId = getStoredInstallation(token);
  if (!installationId) return;

  try {
    await UnregisterPushInstallationApi(token, installationId, { keepalive: true });
  } catch (reason) {
    console.error("Push installation cleanup failed:", reason);
  } finally {
    clearStoredInstallation(token);
  }
}

function hasFirebaseConfig() {
  return Object.values(firebaseConfig).every(Boolean) && Boolean(import.meta.env.VITE_FIREBASE_VAPID_KEY);
}

function showNotificationError(setError, reason, fallbackMessage) {
  console.error(fallbackMessage, reason);
  setError(reason instanceof Error ? reason.message : fallbackMessage);
}

async function registerInstallation() {
  if (!hasFirebaseConfig()) {
    throw new Error("Firebase web configuration is incomplete.");
  }
  if (!(await isSupported())) {
    throw new Error(
      "Firebase Messaging is not supported in this browser context. Use a normal browser window instead of private browsing.",
    );
  }
  if (Notification.permission === "denied") {
    throw new Error("Browser notification permission is blocked. Allow notifications for this site and try again.");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }
  const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  let serviceWorkerRegistration;
  try {
    serviceWorkerRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    await serviceWorkerRegistration.update();
    serviceWorkerRegistration = await navigator.serviceWorker.ready;
    if (!serviceWorkerRegistration.active) {
      throw new Error("Firebase service worker did not activate.");
    }
  } catch (reason) {
    throw new Error(
      `Firebase service worker registration failed: ${reason instanceof Error ? reason.message : String(reason)}`,
      { cause: reason },
    );
  }

  try {
    const messaging = getMessaging(app);
    return await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration,
    });
  } catch (reason) {
    throw new Error(
      `Firebase token generation failed: ${reason instanceof Error ? reason.message : String(reason)}`,
      { cause: reason },
    );
  }
}

export default function NotificationToggle({ token }) {
  const [installationId, setInstallationId] = useState(() => getStoredInstallation(token));
  const [enabled, setEnabled] = useState(false);
  const [loadedToken, setLoadedToken] = useState(null);
  const [error, setError] = useState("");
  const loadingPreference = Boolean(token) && loadedToken !== token;

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;
    GetUserPreferenceApi(token, "push_notifications")
      .then((value) => {
        if (active) setEnabled(value === true);
      })
      .catch((reason) => {
        if (active) {
          showNotificationError(setError, reason, "Could not load notification preference.");
        }
      })
      .finally(() => {
        if (active) setLoadedToken(token);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !installationId) return undefined;

    const unregisterOnPageClose = () => {
      void UnregisterPushInstallationApi(token, installationId, { keepalive: true }).catch((reason) => {
        console.error("Push installation cleanup failed:", reason);
      });
      clearStoredInstallation(token);
    };
    window.addEventListener("pagehide", unregisterOnPageClose);
    return () => window.removeEventListener("pagehide", unregisterOnPageClose);
  }, [installationId, token]);

  useEffect(() => {
    if (!enabled || !hasFirebaseConfig()) return undefined;

    try {
      const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
      return onMessage(getMessaging(app), ({ notification }) => {
        if (document.visibilityState === "visible" && notification?.title && notification?.body) {
          new Notification(notification.title, { body: notification.body });
        }
        window.dispatchEvent(new Event("notification-refresh"));
      });
    } catch (reason) {
      showNotificationError(setError, reason, "Could not set up foreground notifications.");
      return undefined;
    }
  }, [enabled]);

  const disable = async () => {
    try {
      await SetUserPreferenceApi(token, "push_notifications", false);
      if (installationId) {
        await UnregisterPushInstallationApi(token, installationId);
      }
      clearStoredInstallation(token);
      setEnabled(false);
      setInstallationId("");
      setError("");
    } catch (reason) {
      showNotificationError(setError, reason, "Could not disable notifications.");
    }
  };

  const toggle = () => {
    if (enabled) {
      void disable();
    } else {
      registerInstallation()
        .then((id) => {
          if (!id) throw new Error("Firebase did not return an installation ID.");
          return RegisterPushInstallationApi(token, id).then((registered) => {
            if (!registered) throw new Error("Could not register notifications.");
            return SetUserPreferenceApi(token, "push_notifications", true).then(() => {
              setInstallationId(id);
              storeInstallation(token, id);
              setEnabled(true);
            }).catch(async (reason) => {
              await UnregisterPushInstallationApi(token, id);
              throw reason;
            });
          });
        })
        .catch((reason) => {
          showNotificationError(setError, reason, "Could not enable notifications.");
        });
    }
  };

  return (
    <>
      <button
        type="button"
        className={`notification-toggle ${enabled ? "notification-toggle-enabled" : ""}`}
        onClick={toggle}
        disabled={!token || loadingPreference}
        aria-label={enabled ? "Disable notifications" : "Enable notifications"}
        aria-pressed={enabled}
        title={enabled ? "Notifications enabled" : "Notifications disabled"}
      >
        {enabled ? <BellRing aria-hidden="true" /> : <BellOff aria-hidden="true" />}
      </button>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={(_event, reason) => {
          if (reason !== "clickaway") setError("");
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setError("")}
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
