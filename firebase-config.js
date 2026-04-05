import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAr9t2F5wIHbAiKIic6-rIvcnNlMJ7uayA",
    authDomain: "myporfolio-150815.firebaseapp.com",
    projectId: "myporfolio-150815",
    storageBucket: "myporfolio-150815.firebasestorage.app",
    messagingSenderId: "537831926993",
    appId: "1:537831926993:web:f64432eb97ed54e5d1a9f0",
    measurementId: "G-NW7Y47PVCX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
