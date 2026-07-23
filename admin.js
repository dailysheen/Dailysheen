// ==========================================
// Daily Sheen V7
// Admin Login System - Part 2
// Firebase Email/Password Authentication
// ==========================================

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { app } from "./firebase-config.js";


// ==========================================
// Firebase Authentication
// ==========================================

const auth = getAuth(app);


// ==========================================
// HTML Elements
// ==========================================

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const messageBox = document.getElementById("msg");


// ==========================================
// Message Function
// ==========================================

function showMessage(message, type = "error") {

  if (!messageBox) return;

  messageBox.textContent = message;

  messageBox.style.color =
    type === "success" ? "#00c853" : "#ff5252";

}


// ==========================================
// Admin Login
// ==========================================

if (loginBtn) {

  loginBtn.addEventListener("click", async () => {

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();


    // Empty Input Check
    if (!email || !password) {

      showMessage("Email এবং Password দিন।");

      return;

    }


    // Loading
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    showMessage("Login হচ্ছে...", "success");


    try {

      // Firebase Login
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );


      const user = userCredential.user;


      // Login Success
      showMessage(
        "Login সফল হয়েছে। স্বাগতম " + user.email,
        "success"
      );


      // 1.5 seconds পরে Admin Dashboard
      setTimeout(() => {

        window.location.href = "admin-dashboard.html";

      }, 1500);


    } catch (error) {

      console.error("Login Error:", error);


      let errorMessage =
        "Login ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";


      // Firebase Error Handling

      if (
        error.code ===
        "auth/invalid-credential"
      ) {

        errorMessage =
          "Email অথবা Password ভুল।";

      }

      else if (
        error.code ===
        "auth/invalid-email"
      ) {

        errorMessage =
          "সঠিক Email Address দিন।";

      }

      else if (
        error.code ===
        "auth/user-disabled"
      ) {

        errorMessage =
          "এই Admin Account নিষ্ক্রিয় করা হয়েছে।";

      }

      else if (
        error.code ===
        "auth/too-many-requests"
      ) {

        errorMessage =
          "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

      }


      showMessage(errorMessage);


      // Button Reset
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";

    }

  });

}


// ==========================================
// Enter Key Login
// ==========================================

if (passwordInput) {

  passwordInput.addEventListener(
    "keypress",
    (event) => {

      if (event.key === "Enter") {

        loginBtn.click();

      }

    }
  );

}


// ==========================================
// Authentication State Check
// ==========================================

onAuthStateChanged(auth, (user) => {

  if (user) {

    console.log(
      "Admin logged in:",
      user.email
    );

  } else {

    console.log(
      "No Admin logged in"
    );

  }

});


// ==========================================
// Logout Function
// ==========================================

window.adminLogout = async function () {

  try {

    await signOut(auth);

    window.location.href =
      "admin.html";

  } catch (error) {

    console.error(
      "Logout Error:",
      error
    );

  }

};
