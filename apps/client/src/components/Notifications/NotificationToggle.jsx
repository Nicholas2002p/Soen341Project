import { useEffect, useState } from "react";
import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
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

function hasFirebaseConfig() {
  return Object.values(firebaseConfig).every(Boolean);
}

async function registerInstallation(token) {
  if (!hasFirebaseConfig() || !(await isSupported())) {
    throw new Error("Firebase messaging is unavailable.");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }
  const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  return getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });
}

export default function NotificationToggle({ token }) {
  const [enabled, setEnabled] = useState(false);
  const [installationId, setInstallationId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setEnabled(false);
      setInstallationId("");
      return undefined;
    }

    setError("");
    return undefined;
  }, [token]);

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
      registerInstallation(token)
        .then((id) => {
          if (!id) throw new Error("Firebase did not return an installation ID.");
          return RegisterPushInstallationApi(token, id).then((registered) => {
            if (!registered) throw new Error("Could not register notifications.");
            setInstallationId(id);
            setEnabled(true);
          });
        })
        .catch(() => setError("Notifications are unavailable."));
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
