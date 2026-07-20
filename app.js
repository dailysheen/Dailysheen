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

// ==============================
// Live Search
// ==============================

function searchNews(){

const input = document
.getElementById("searchBox")
.value
.toLowerCase();

const cards =
document.querySelectorAll(
".news-card,.breaking-card"
);

cards.forEach(card=>{

const text =
card.innerText.toLowerCase();

if(text.includes(input)){

card.style.display="block";

}else{

card.style.display="none";

}

});

}



// ==============================
// Back To Top Button
// ==============================

const topBtn =
document.createElement("button");

topBtn.innerHTML="⬆";

topBtn.id="topBtn";

document.body.appendChild(topBtn);

topBtn.style.position="fixed";
topBtn.style.right="20px";
topBtn.style.bottom="20px";
topBtn.style.width="50px";
topBtn.style.height="50px";
topBtn.style.border="none";
topBtn.style.borderRadius="50%";
topBtn.style.background="#6a11cb";
topBtn.style.color="#fff";
topBtn.style.cursor="pointer";
topBtn.style.display="none";
topBtn.style.fontSize="20px";
topBtn.style.zIndex="9999";

window.addEventListener("scroll",()=>{

if(window.scrollY>300){

topBtn.style.display="block";

}else{

topBtn.style.display="none";

}

});

topBtn.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};



// ==============================
// Fade Animation
// ==============================

const observer =
new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity="1";
entry.target.style.transform="translateY(0)";

}

});

});

document.querySelectorAll(
".news-card,.breaking-card,.category-card"
).forEach(el=>{

el.style.opacity="0";
el.style.transform="translateY(40px)";
el.style.transition=".6s";

observer.observe(el);

});
