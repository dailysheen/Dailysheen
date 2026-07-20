import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const msg = document.getElementById("msg");

loginBtn.addEventListener("click", async () => {

    msg.innerHTML = "Logging in...";

    try {

        await signInWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );

        msg.innerHTML = "Login Successful";

        window.location.href = "dashboard.html";

    } catch (e) {

        msg.innerHTML = e.message;

    }

});
