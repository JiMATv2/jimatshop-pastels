importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA6Ighi9Jq-ML4O2No5chCq-VYn5nTz5Zk",
  authDomain: "jimat-294609.firebaseapp.com",
  projectId: "jimat-294609",
  storageBucket: "jimat-294609.appspot.com",
  messagingSenderId: "552393042714",
  appId: "1:552393042714:web:1d7082f61bc30311821aa3",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification?.title || "New Update";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: "buyer-follow",
    requireInteraction: true,
    data: {
      url: payload.data?.url || "/",
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "open" || !event.action) {
    const urlToOpen = event.notification.data?.url || "/";
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
    );
  }
});

