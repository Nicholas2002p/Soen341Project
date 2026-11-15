/* global importScripts, firebase */

importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCYsLnj3pibr4WbuTfk9BdxEDz2_6WprNA",
  authDomain: "soen341project-6988e.firebaseapp.com",
  projectId: "soen341project-6988e",
  storageBucket: "soen341project-6988e.firebasestorage.app",
  messagingSenderId: "197548127370",
  appId: "1:197548127370:web:70477db53442849d39e973",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(({ notification }) => {
  if (!notification?.title || !notification?.body) return;
  self.registration.showNotification(notification.title, {
    body: notification.body,
  });
});
