import { useEffect, useState } from "react";
import {
  GetNotificationsApi,
  MarkNotificationReadApi,
  CreateNotificationStreamTicketApi,
  GetNotificationStreamUrl,
} from "../../utils/Api";
import "./NotificationCenter.scss";

export default function NotificationCenter({ token }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    const loadNotifications = async () => {
      setLoading(true);
      setError("");
      try {
        const items = await GetNotificationsApi(token);
        if (active) setNotifications(items);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load notifications.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadNotifications();
    let stream;
    let streamFallback;
    const openStream = async () => {
      try {
        const { ticket } = await CreateNotificationStreamTicketApi(token);
        if (!active) return;
        stream = new EventSource(GetNotificationStreamUrl(ticket));
        stream.addEventListener("notification", () => {
          void loadNotifications();
        });
      } catch (reason) {
        console.error("Notification stream setup failed:", reason);
      }
    };

    void openStream();
    streamFallback = window.setInterval(() => {
      void loadNotifications();
    }, 60_000);

    const refreshNotification = () => {
      void loadNotifications();
    };
    window.addEventListener("notification-refresh", refreshNotification);

    return () => {
      active = false;
      stream?.close();
      window.clearInterval(streamFallback);
      window.removeEventListener("notification-refresh", refreshNotification);
    };
  }, [token]);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  const openSidebar = () => {
    setOpen(true);
    if (token) {
      setLoading(true);
      setError("");
      GetNotificationsApi(token)
        .then((items) => setNotifications(items))
        .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load notifications."))
        .finally(() => setLoading(false));
    }
  };

  const markRead = async (notification) => {
    if (notification.readAt) return;

    const marked = await MarkNotificationReadApi(token, notification.id);
    if (marked) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        ),
      );
    }
  };

  return (
    <>
      <button
        type="button"
        className="notification-bell"
        onClick={openSidebar}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {open && (
        <>
          <aside className="notification-sidebar" aria-label="Notifications">
            <header className="notification-sidebar-header">
              <h2>Notifications</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications">
                &times;
              </button>
            </header>

            <div className="notification-list">
              {loading && <p className="notification-status">Loading notifications...</p>}
              {!loading && error && <p className="notification-status notification-error">{error}</p>}
              {!loading && !error && notifications.length === 0 && (
                <p className="notification-status">No notifications yet.</p>
              )}
              {!loading &&
                notifications
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      className={`notification-item ${notification.readAt ? "notification-read" : ""}`}
                      onClick={() => void markRead(notification)}
                    >
                      <span className="notification-item-title">{notification.title}</span>
                      <span className="notification-item-body">{notification.body}</span>
                      <time dateTime={notification.createdAt}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </time>
                    </button>
                  ))}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
