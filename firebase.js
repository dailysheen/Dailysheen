// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDAjVouODY_7hCgNpTZiDEUIKfT70fhCB0",
  authDomain: "daily-sheen.firebaseapp.com",
  projectId: "daily-sheen",
  storageBucket: "daily-sheen.firebasestorage.app",
  messagingSenderId: "521433909326",
  appId: "1:521433909326:web:70e43e713f21b93e6d1b1f"
};

// Initialize
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
