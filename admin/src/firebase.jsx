// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// TODO: Replace the following with your app's Firebase project configuration
// You can get these from Firebase Console -> Project Settings -> General -> Your Apps -> Web
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to request permission and get token
export const requestPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {

            // Register Service Worker with Env Params
            const swUrl = `${import.meta.env.BASE_URL}firebase-messaging-sw.js?apiKey=${firebaseConfig.apiKey}&authDomain=${firebaseConfig.authDomain}&projectId=${firebaseConfig.projectId}&storageBucket=${firebaseConfig.storageBucket}&messagingSenderId=${firebaseConfig.messagingSenderId}&appId=${firebaseConfig.appId}`;

            const registration = await navigator.serviceWorker.register(swUrl);

            // Get Token
            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // Optional: Get from Firebase Console -> Cloud Messaging -> Web Configuration
                serviceWorkerRegistration: registration
            });
            console.log("FCM Token:", token);
            return token;
        } else {
            console.log("Notification permission denied");
            return null;
        }
    } catch (error) {
        console.error("Error requesting permission:", error);
        return null;
    }
};

// Export messaging instance for onMessage listener
export { messaging, onMessage };
