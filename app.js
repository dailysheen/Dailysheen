/* ======================================
   Daily Sheen V6 Professional
   app.js - Part 1
====================================== */

/* ==========================
   Dark Mode
========================== */

const darkBtn = document.getElementById("darkBtn");

if (darkBtn) {
    darkBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            darkBtn.innerHTML = "☀️ Light Mode";
            localStorage.setItem("theme", "dark");
        } else {
            darkBtn.innerHTML = "🌙 Dark Mode";
            localStorage.setItem("theme", "light");
        }
    });
}

/* আগের Theme মনে রাখবে */

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");

    if (darkBtn) {
        darkBtn.innerHTML = "☀️ Light Mode";
    }
}

/* ==========================
   Live Clock
========================== */

function updateClock() {

    const now = new Date();

    const clock = document.getElementById("liveClock");
    const date = document.getElementById("liveDate");

    if (clock) {
        clock.innerHTML = now.toLocaleTimeString("en-GB");
    }

    if (date) {
        date.innerHTML = now.toLocaleDateString("bn-BD", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }
}

setInterval(updateClock, 1000);

updateClock();

/* ==========================
   Weather Demo
========================== */

const weatherData = [
    { temp: "31°C", status: "☀️ Sunny" },
    { temp: "29°C", status: "⛅ Cloudy" },
    { temp: "27°C", status: "🌧 Rain" },
    { temp: "30°C", status: "🌤 Partly Cloudy" }
];

let weatherIndex = 0;

function updateWeather() {

    const temp = document.getElementById("weatherTemp");
    const status = document.getElementById("weatherStatus");

    if (temp && status) {

        temp.innerHTML = weatherData[weatherIndex].temp;
        status.innerHTML = weatherData[weatherIndex].status;

        weatherIndex++;

        if (weatherIndex >= weatherData.length) {
            weatherIndex = 0;
        }
    }
}

setInterval(updateWeather, 5000);

updateWeather();

/* ======================================
   Daily Sheen V6 Professional
   app.js - Part 2
====================================== */

/* ==========================
   Search
========================== */

function searchNews(){

    const input=document
        .getElementById("searchBox")
        .value
        .toLowerCase();

    const cards=document.querySelectorAll(
        ".news-card,.featured-card,.trend-card"
    );

    cards.forEach(card=>{

        const text=card.innerText.toLowerCase();

        if(text.includes(input)){
            card.style.display="";
        }else{
            card.style.display="none";
        }

    });

}

/* Enter Key Search */

const searchInput=document.getElementById("searchBox");

if(searchInput){

searchInput.addEventListener("keyup",function(e){

if(e.key==="Enter"){
searchNews();
}

});

}

/* ==========================
   Back To Top
========================== */

const topBtn=document.getElementById("topBtn");

window.addEventListener("scroll",()=>{

if(window.scrollY>400){

topBtn.style.display="block";

}else{

topBtn.style.display="none";

}

});

if(topBtn){

topBtn.style.display="none";

topBtn.onclick=function(){

window.scrollTo({

top:0,

behavior:"smooth"

});

};

}

/* ==========================
   Simple Hero Slider
========================== */

const heroImages=[
"assets/banner.png",
"assets/news1.jpg",
"assets/news2.jpg",
"assets/news3.jpg"
];

let heroIndex=0;

const heroBanner=document.querySelector(".hero-banner");

if(heroBanner){

setInterval(()=>{

heroIndex++;

if(heroIndex>=heroImages.length){

heroIndex=0;

}

heroBanner.src=heroImages[heroIndex];

},4000);

}

/* ==========================
   Fade Animation
========================== */

const observer=new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity="1";

entry.target.style.transform="translateY(0)";

}

});

});

document.querySelectorAll(
".news-card,.featured-card,.trend-card,.category-card,.widget"
).forEach(el=>{

el.style.opacity="0";
el.style.transform="translateY(30px)";
el.style.transition=".6s";

observer.observe(el);

});

/* ======================================
   Daily Sheen V6 Professional
   app.js - Part 3 Final
====================================== */


/* ==========================
   Newsletter Subscribe
========================== */

const newsletterForm = document.querySelector(".newsletter form");

if(newsletterForm){

newsletterForm.addEventListener("submit",function(e){

e.preventDefault();

alert("ধন্যবাদ! Daily Sheen Newsletter-এর জন্য আপনার সাবস্ক্রিপশন গ্রহণ করা হয়েছে।");

});

}


/* ==========================
   Breaking News Auto Update
========================== */

const breakingText = document.querySelector(
".breaking-scroll marquee"
);

const breakingNews = [

"বাংলাদেশের সর্বশেষ সংবাদ দেখুন Daily Sheen-এ",

"স্বাস্থ্য ও চিকিৎসা বিষয়ক নতুন তথ্য প্রকাশিত হয়েছে",

"প্রযুক্তির নতুন আপডেট জানতে আমাদের সাথে থাকুন",

"খেলাধুলার সর্বশেষ খবর এখন Daily Sheen-এ"

];

let breakingIndex = 0;


if(breakingText){

setInterval(()=>{

breakingIndex++;

if(breakingIndex >= breakingNews.length){

breakingIndex = 0;

}

breakingText.innerHTML = breakingNews[breakingIndex];


},7000);

}



/* ==========================
   Current Year Footer
========================== */

const year = document.querySelector(".copyright");

if(year){

const currentYear = new Date().getFullYear();

year.innerHTML = 
`© ${currentYear} Daily Sheen. All Rights Reserved.`;

}



/* ==========================
   Image Lazy Loading
========================== */

document.querySelectorAll("img").forEach(img=>{

img.setAttribute("loading","lazy");

});



/* ==========================
   Smooth Anchor Scroll
========================== */

document.querySelectorAll('a[href^="#"]').forEach(link=>{

link.addEventListener("click",function(e){

const target=document.querySelector(
this.getAttribute("href")
);

if(target){

e.preventDefault();

target.scrollIntoView({

behavior:"smooth"

});

}

});

});
