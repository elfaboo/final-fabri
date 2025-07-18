importScripts('https://www.gstatic.com/firebasejs/10.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.3.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAS7a5mV9As2GfbuzI4MIRp6Zv1itYDUBg",
  authDomain: "pwa-notificaciones-fabri.firebaseapp.com",
  projectId: "pwa-notificaciones-fabri",
  storageBucket: "pwa-notificaciones-fabri.firebaseapp.com",
  messagingSenderId: "140521245389",
  appId: "1:140521245389:web:a263c7b9c9d0ed07443784"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});