import { useEffect, useState } from "react";
import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import {
  RegisterPushInstallationApi,
  UnregisterPushInstallationApi,
} from "../../utils/Api";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const notificationBuild = "fcm-diagnostics-2026-11-10";

function hasFirebaseConfig() {
  return Object.values(firebaseConfig).every(Boolean) && Boolean(import.meta.env.VITE_FIREBASE_VAPID_KEY);
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
  const [enabled, setEnabled] = useState(false);
  const [installationId, setInstallationId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled || !hasFirebaseConfig()) return undefined;

    try {
      const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
      return onMessage(getMessaging(app), ({ notification }) => {
        if (document.visibilityState === "visible" && notification?.title && notification?.body) {
          new Notification(notification.title, { body: notification.body });
        }
      });
    } catch (reason) {
      console.error("Firebase foreground messaging setup failed:", reason);
      return undefined;
    }
  }, [enabled]);

  const disable = async () => {
    if (installationId) {
      await UnregisterPushInstallationApi(token, installationId);
    }
    setEnabled(false);
    setInstallationId("");
    setError("");
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
            setInstallationId(id);
            setEnabled(true);
          });
        })
        .catch((reason) => {
          console.error("Firebase notification registration failed:", reason);
          const message = reason instanceof Error ? reason.message : String(reason);
          setError(`${message} (${notificationBuild})`);
        });
    }
  };

  return (
    <label>
      <input
        type="checkbox"
        checked={enabled}
        onChange={toggle}
        disabled={!token}
      />
      Notifications
      {error && <span role="alert">{error}</span>}
    </label>
  );
}
