/* =====================================================
   Daily Sheen V7 Professional
   app.js
   Firebase Firestore + Website Features
===================================================== */


/* =====================================================
   1. FIREBASE
===================================================== */

import { app } from "./firebase-config.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const db = getFirestore(app);


/* =====================================================
   2. GLOBAL NEWS DATA
===================================================== */

let allNews = [];


/* =====================================================
   3. DARK MODE
===================================================== */

const darkBtn = document.getElementById("darkBtn");

if (darkBtn) {

    darkBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (
            document.body.classList.contains("dark")
        ) {

            darkBtn.innerHTML =
                "☀️ Light Mode";

            localStorage.setItem(
                "theme",
                "dark"
            );

        } else {

            darkBtn.innerHTML =
                "🌙 Dark Mode";

            localStorage.setItem(
                "theme",
                "light"
            );

        }

    });

}


/* Load Saved Theme */

if (
    localStorage.getItem("theme") === "dark"
) {

    document.body.classList.add("dark");

    if (darkBtn) {

        darkBtn.innerHTML =
            "☀️ Light Mode";

    }

}


/* =====================================================
   4. LIVE CLOCK
===================================================== */

function updateClock() {

    const now =
        new Date();

    const clock =
        document.getElementById(
            "liveClock"
        );

    const date =
        document.getElementById(
            "liveDate"
        );


    if (clock) {

        clock.innerHTML =
            now.toLocaleTimeString(
                "en-GB"
            );

    }


    if (date) {

        date.innerHTML =
            now.toLocaleDateString(
                "bn-BD",
                {

                    weekday:
                        "long",

                    day:
                        "numeric",

                    month:
                        "long",

                    year:
                        "numeric"

                }
            );

    }

}


setInterval(
    updateClock,
    1000
);

updateClock();


/* =====================================================
   5. WEATHER DEMO
===================================================== */

const weatherData = [

    {
        temp: "31°C",
        status: "☀️ Sunny"
    },

    {
        temp: "29°C",
        status: "⛅ Cloudy"
    },

    {
        temp: "27°C",
        status: "🌧 Rain"
    },

    {
        temp: "30°C",
        status: "🌤 Partly Cloudy"
    }

];


let weatherIndex = 0;


function updateWeather() {

    const temp =
        document.getElementById(
            "weatherTemp"
        );

    const status =
        document.getElementById(
            "weatherStatus"
        );


    if (
        temp &&
        status
    ) {

        temp.innerHTML =
            weatherData[
                weatherIndex
            ].temp;


        status.innerHTML =
            weatherData[
                weatherIndex
            ].status;


        weatherIndex++;


        if (
            weatherIndex >=
            weatherData.length
        ) {

            weatherIndex = 0;

        }

    }

}


setInterval(
    updateWeather,
    5000
);

updateWeather();


/* =====================================================
   6. FIREBASE NEWS LOAD
===================================================== */

async function loadNews() {

    const newsGrid =
        document.querySelector(
            ".news-grid"
        );


    const featuredGrid =
        document.querySelector(
            ".featured-grid"
        );


    const trendingNews =
        document.querySelector(
            ".trending-news"
        );


    try {

        console.log(
            "Loading News from Firebase..."
        );


        const newsQuery =
            query(

                collection(
                    db,
                    "news"
                ),

                orderBy(
                    "createdAt",
                    "desc"
                )

            );


        const snapshot =
            await getDocs(
                newsQuery
            );


        allNews = [];


        snapshot.forEach(
            (newsDoc) => {

                const data =
                    newsDoc.data();


                allNews.push({

                    id:
                        newsDoc.id,

                    category:
                        data.category ||
                        "অন্যান্য",

                    title:
                        data.title ||
                        "সংবাদের শিরোনাম নেই",

                    description:
                        data.description ||
                        "",

                    image:
                        data.image ||
                        "assets/news1.jpg",

                    createdAt:
                        data.createdAt ||
                        null

                });

            }
        );


        console.log(
            "Firebase News:",
            allNews.length
        );


        renderNews(
            allNews
        );


    } catch (error) {

        console.error(
            "Firebase News Error:",
            error
        );


        if (newsGrid) {

            newsGrid.innerHTML = `

                <div class="empty-news">

                    <h3>
                        ❌ সংবাদ লোড করা যায়নি
                    </h3>

                    <p>
                        Firebase Firestore সংযোগ পরীক্ষা করুন।
                    </p>

                </div>

            `;

        }

    }

}


/* =====================================================
   7. RENDER NEWS
===================================================== */

function renderNews(
    newsData
) {

    const newsGrid =
        document.querySelector(
            ".news-grid"
        );


    const featuredGrid =
        document.querySelector(
            ".featured-grid"
        );


    const trendingNews =
        document.querySelector(
            ".trending-news"
        );


    /* =================================================
       LATEST NEWS
    ================================================= */

    if (newsGrid) {

        newsGrid.innerHTML =
            "";


        if (
            newsData.length === 0
        ) {

            newsGrid.innerHTML = `

                <div class="empty-news">

                    📰 এখনো কোনো সংবাদ প্রকাশিত হয়নি।

                </div>

            `;

        }


        newsData.forEach(
            (news) => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "news-card";


                card.innerHTML = `

                    <img
                        src="${escapeHTML(
                            news.image
                        )}"
                        alt="${escapeHTML(
                            news.title
                        )}"
                        loading="lazy"
                        onerror="
                            this.src='assets/news1.jpg'
                        "
                    >


                    <span class="badge">

                        ${escapeHTML(
                            news.category
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            news.title
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            news.description
                        )}

                    </p>


                    <a href="#">

                        বিস্তারিত পড়ুন →

                    </a>

                `;


                newsGrid.appendChild(
                    card
                );

            }
        );

    }


    /* =================================================
       FEATURED NEWS
    ================================================= */

    if (featuredGrid) {

        featuredGrid.innerHTML =
            "";


        const featured =
            newsData.slice(
                0,
                2
            );


        featured.forEach(
            (news) => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "featured-card";


                card.innerHTML = `

                    <img
                        src="${escapeHTML(
                            news.image
                        )}"
                        alt="${escapeHTML(
                            news.title
                        )}"
                        loading="lazy"
                        onerror="
                            this.src='assets/news1.jpg'
                        "
                    >


                    <div class="featured-content">

                        <span class="badge">

                            ${escapeHTML(
                                news.category
                            )}

                        </span>


                        <h3>

                            ${escapeHTML(
                                news.title
                            )}

                        </h3>


                        <p>

                            ${escapeHTML(
                                news.description
                            )}

                        </p>


                        <a href="#">

                            Read More →

                        </a>

                    </div>

                `;


                featuredGrid.appendChild(
                    card
                );

            }
        );

    }


    /* =================================================
       TRENDING NEWS
    ================================================= */

    if (trendingNews) {

        trendingNews.innerHTML =
            "";


        const trending =
            newsData.slice(
                0,
                3
            );


        trending.forEach(
            (news) => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "trend-card";


                card.innerHTML = `

                    <img
                        src="${escapeHTML(
                            news.image
                        )}"
                        alt="${escapeHTML(
                            news.title
                        )}"
                        loading="lazy"
                        onerror="
                            this.src='assets/news1.jpg'
                        "
                    >


                    <div>

                        <span class="badge">

                            ${escapeHTML(
                                news.category
                            )}

                        </span>


                        <h3>

                            ${escapeHTML(
                                news.title
                            )}

                        </h3>


                        <p>

                            ${escapeHTML(
                                news.description
                            )}

                        </p>


                        <a href="#">

                            আরও পড়ুন →

                        </a>

                    </div>

                `;


                trendingNews.appendChild(
                    card
                );

            }
        );

    }


    /* Re-enable Animation */

    enableAnimations();

}


/* =====================================================
   8. SEARCH
===================================================== */

function searchNews() {

    const input =
        document.getElementById(
            "searchBox"
        );


    if (!input) {

        return;

    }


    const keyword =
        input.value
            .trim()
            .toLowerCase();


    if (
        !keyword
    ) {

        renderNews(
            allNews
        );

        return;

    }


    const filtered =
        allNews.filter(
            (news) => {

                return (

                    news.title
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                    ||

                    news.description
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                    ||

                    news.category
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                );

            }
        );


    renderNews(
        filtered
    );

}


/* Make Search Global */

window.searchNews =
    searchNews;


/* Search Enter Key */

const searchInput =
    document.getElementById(
        "searchBox"
    );


if (searchInput) {

    searchInput.addEventListener(
        "keyup",
        (event) => {

            if (
                event.key ===
                "Enter"
            ) {

                searchNews();

            }

        }
    );

}


/* =====================================================
   9. CATEGORY NAVIGATION
===================================================== */

const navLinks =
    document.querySelectorAll(
        "nav a"
    );


navLinks.forEach(
    (link) => {

        link.addEventListener(
            "click",
            (event) => {

                event.preventDefault();


                const category =
                    link.textContent
                        .trim();


                /* Home */

                if (
                    category ===
                    "হোম"
                ) {

                    renderNews(
                        allNews
                    );

                    window.scrollTo({

                        top:
                            0,

                        behavior:
                            "smooth"

                    });

                    return;

                }


                /* Contact */

                if (
                    category ===
                    "যোগাযোগ"
                ) {

                    const contact =
                        document.querySelector(
                            ".contact-box"
                        );


                    if (contact) {

                        contact.scrollIntoView({

                            behavior:
                                "smooth"

                        });

                    }

                    return;

                }


                /* Filter */

                const filtered =
                    allNews.filter(
                        (news) => {

                            return (

                                news.category
                                    .trim()
                                    .toLowerCase()

                                ===

                                category
                                    .trim()
                                    .toLowerCase()

                            );

                        }
                    );


                renderNews(
                    filtered
                );


                const latest =
                    document.querySelector(
                        ".latest-news"
                    );


                if (latest) {

                    latest.scrollIntoView({

                        behavior:
                            "smooth"

                    });

                }

            }
        );

    }
);


/* =====================================================
   10. BACK TO TOP
===================================================== */

const topBtn =
    document.getElementById(
        "topBtn"
    );


if (topBtn) {

    topBtn.style.display =
        "none";


    window.addEventListener(
        "scroll",
        () => {

            if (
                window.scrollY >
                400
            ) {

                topBtn.style.display =
                    "block";

            } else {

                topBtn.style.display =
                    "none";

            }

        }
    );


    topBtn.onclick =
        function () {

            window.scrollTo({

                top:
                    0,

                behavior:
                    "smooth"

            });

        };

}


/* =====================================================
   11. HERO SLIDER
===================================================== */

const heroImages = [

    "assets/banner.png",

    "assets/news1.jpg",

    "assets/news2.jpg",

    "assets/news3.jpg"

];


let heroIndex =
    0;


const heroBanner =
    document.querySelector(
        ".hero-banner"
    );


if (heroBanner) {

    setInterval(
        () => {

            heroIndex++;


            if (
                heroIndex >=
                heroImages.length
            ) {

                heroIndex =
                    0;

            }


            heroBanner.src =
                heroImages[
                    heroIndex
                ];

        },
        4000
    );

}


/* =====================================================
   12. FADE ANIMATION
===================================================== */

let observer;


function enableAnimations() {

    if (
        !window.IntersectionObserver
    ) {

        return;

    }


    observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.style.opacity =
                                "1";


                            entry.target.style.transform =
                                "translateY(0)";

                        }

                    }
                );

            }
        );


    document.querySelectorAll(

        ".news-card," +

        ".featured-card," +

        ".trend-card," +

        ".category-card," +

        ".widget"

    ).forEach(
        (el) => {

            el.style.opacity =
                "0";


            el.style.transform =
                "translateY(30px)";


            el.style.transition =
                ".6s";


            observer.observe(
                el
            );

        }
    );

}


/* =====================================================
   13. NEWSLETTER
===================================================== */

const newsletterForm =
    document.querySelector(
        ".newsletter form"
    );


if (newsletterForm) {

    newsletterForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            alert(

                "ধন্যবাদ! Daily Sheen Newsletter-এর জন্য আপনার সাবস্ক্রিপশন গ্রহণ করা হয়েছে।"

            );

        }
    );

}


/* =====================================================
   14. BREAKING NEWS
===================================================== */

const breakingText =
    document.querySelector(
        ".breaking-scroll marquee"
    );


const breakingNews = [

    "বাংলাদেশের সর্বশেষ সংবাদ দেখুন Daily Sheen-এ",

    "স্বাস্থ্য ও চিকিৎসা বিষয়ক নতুন তথ্য প্রকাশিত হয়েছে",

    "প্রযুক্তির নতুন আপডেট জানতে আমাদের সাথে থাকুন",

    "খেলাধুলার সর্বশেষ খবর এখন Daily Sheen-এ"

];


let breakingIndex =
    0;


if (breakingText) {

    setInterval(
        () => {

            breakingIndex++;


            if (
                breakingIndex >=
                breakingNews.length
            ) {

                breakingIndex =
                    0;

            }


            breakingText.innerHTML =
                breakingNews[
                    breakingIndex
                ];

        },
        7000
    );

}


/* =====================================================
   15. CURRENT YEAR
===================================================== */

const year =
    document.querySelector(
        ".copyright"
    );


if (year) {

    const currentYear =
        new Date()
            .getFullYear();


    year.innerHTML =

        `© ${currentYear} Daily Sheen. All Rights Reserved.`;

}


/* =====================================================
   16. IMAGE LAZY LOADING
===================================================== */

document
    .querySelectorAll(
        "img"
    )
    .forEach(
        (img) => {

            img.setAttribute(
                "loading",
                "lazy"
            );

        }
    );


/* =====================================================
   17. SMOOTH ANCHOR SCROLL
===================================================== */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(
        (link) => {

            link.addEventListener(
                "click",
                function (event) {

                    const href =
                        this.getAttribute(
                            "href"
                        );


                    if (
                        href ===
                        "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if (target) {

                        event.preventDefault();


                        target.scrollIntoView({

                            behavior:
                                "smooth"

                        });

                    }

                }
            );

        }
    );


/* =====================================================
   18. ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   19. START APPLICATION
===================================================== */

loadNews();


console.log(
    "✅ Daily Sheen V7 App Loaded Successfully"
);
