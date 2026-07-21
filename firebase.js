import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyDAjVjouODY_7hCgNpTziDEUkF7QbhCbE",
  authDomain: "daily-sheen.firebaseapp.com",
  projectId: "daily-sheen",
  storageBucket: "daily-sheen.firebasestorage.app",
  messagingSenderId: "521433909326",
  appId: "1:521433909326:web:70e43e713f21b93e6d1b1f"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


export { app, auth, db };
