// Scripts for firebase messaging service worker

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// We parse the config from the URL query parameters passed during registration.
const params = new URLSearchParams(location.search);

const firebaseConfig = {
    apiKey: params.get("apiKey"),
    authDomain: params.get("authDomain"),
    projectId: params.get("projectId"),
    storageBucket: params.get("storageBucket"),
    messagingSenderId: params.get("messagingSenderId"),
    appId: params.get("appId"),
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png', // Use your app logo
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    console.log('Notification click received', event);
    event.notification.close();

    // Focus on existing window or open new one
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                // If window is already open and valid, focus it
                if (client.url.indexOf('/') !== -1 && 'focus' in client) {
                    // You could check for specific path match here if needed
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                // Use click_action from payload or default to root
                const urlToOpen = event.notification.data?.click_action || '/';
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
