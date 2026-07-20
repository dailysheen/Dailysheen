// ==============================
// Daily Sheen V4
// app.js - Part 1
// ==============================

// Dark Mode

const darkBtn = document.getElementById("darkBtn");

if (darkBtn) {

    // আগের সেটিং থাকলে সেটি লোড হবে
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        darkBtn.innerHTML = "☀️ Light Mode";
    }

    darkBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {

            localStorage.setItem("theme", "dark");
            darkBtn.innerHTML = "☀️ Light Mode";

        } else {

            localStorage.setItem("theme", "light");
            darkBtn.innerHTML = "🌙 Dark Mode";

        }

    });

}



// ==============================
// Current Date
// ==============================

const dateBox = document.getElementById("today");

if(dateBox){

const today = new Date();

dateBox.innerHTML = today.toLocaleDateString("bn-BD",{

weekday:"long",

year:"numeric",

month:"long",

day:"numeric"

});

}
