// ======================================================
// Daily Sheen
// Firebase Configuration
// ======================================================


// ======================================================
// Firebase App
// ======================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


// ======================================================
// Firebase Configuration
// ======================================================

const firebaseConfig = {

  apiKey:
    "AIzaSyDAjVouODY_7hCgNpTZiDEUKfT7ohfbCR0",

  authDomain:
    "daily-sheen.firebaseapp.com",

  projectId:
    "daily-sheen",

  storageBucket:
    "daily-sheen.firebasestorage.app",

  messagingSenderId:
    "521433909326",

  appId:
    "1:521433909326:web:70e43e713f21b93e6d1b1f"

};


// ======================================================
// Initialize Firebase
// ======================================================

const app =
  initializeApp(
    firebaseConfig
  );


// ======================================================
// Export Firebase App
// ======================================================

export {
  app
};
