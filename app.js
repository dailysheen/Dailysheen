// ==========================================
// Daily Sheen V7
// FINAL app.js
// Firebase Firestore News
// Category + Search + Details Page
// Dark Mode + Clock + Weather + Hero Slider
// ==========================================


/* =====================================================
   FIREBASE
===================================================== */

import { app } from "./firebase-config.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =====================================================
   FIRESTORE
===================================================== */

const db = getFirestore(app);


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let allNews = [];

let currentCategory = "all";


/* =====================================================
   HTML ELEMENTS
===================================================== */

const newsGrid =
    document.getElementById("newsGrid");

const newsMessage =
    document.getElementById("newsMessage");

const newsSectionTitle =
    document.getElementById("newsSectionTitle");

const newsSectionSubtitle =
    document.getElementById("newsSectionSubtitle");

const refreshBtn =
    document.getElementById("refreshBtn");

const searchBox =
    document.getElementById("searchBox");

const searchBtn =
    document.getElementById("searchBtn");

const darkBtn =
    document.getElementById("darkBtn");

const topBtn =
    document.getElementById("topBtn");


/* =====================================================
   CATEGORY NAMES
===================================================== */

const categoryNames = {

    all:
        "সর্বশেষ সংবাদ",

    "বাংলাদেশ":
        "বাংলাদেশ সংবাদ",

    "আন্তর্জাতিক":
        "আন্তর্জাতিক সংবাদ",

    "রাজনীতি":
        "রাজনীতি সংবাদ",

    "স্বাস্থ্য":
        "স্বাস্থ্য সংবাদ",

    "রোগ ও চিকিৎসা":
        "রোগ ও চিকিৎসা সংবাদ",

    "প্রযুক্তি":
        "প্রযুক্তি সংবাদ",

    "খেলাধুলা":
        "খেলাধুলা সংবাদ",

    "চাকরি":
        "চাকরির সংবাদ"

};


/* =====================================================
   GET NEWS DATE
===================================================== */

function getNewsDate(news) {

    try {

        /* Firebase Timestamp */

        if (
            news.createdAt &&
            typeof news.createdAt.toDate === "function"
        ) {

            return news.createdAt.toDate();

        }


        /* JavaScript Date */

        if (
            news.createdAt instanceof Date
        ) {

            return news.createdAt;

        }


        /* String Date */

        if (
            typeof news.createdAt === "string"
        ) {

            const date =
                new Date(news.createdAt);


            if (
                !isNaN(date.getTime())
            ) {

                return date;

            }

        }


        /* Timestamp Number */

        if (
            typeof news.createdAt === "number"
        ) {

            const date =
                new Date(news.createdAt);


            if (
                !isNaN(date.getTime())
            ) {

                return date;

            }

        }


        return new Date(0);


    } catch (error) {

        console.error(
            "Date Error:",
            error
        );

        return new Date(0);

    }

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(news) {

    const date =
        getNewsDate(news);


    if (
        date.getTime() === 0
    ) {

        return "সাম্প্রতিক";

    }


    try {

        return date.toLocaleString(
            "bn-BD",
            {
                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric",

                hour:
                    "numeric",

                minute:
                    "2-digit"
            }
        );

    } catch (error) {

        return "সাম্প্রতিক";

    }

}


/* =====================================================
   SHORT DESCRIPTION
===================================================== */

function createShortDescription(
    text
) {

    const value =
        String(
            text ||
            ""
        ).trim();


    if (
        value.length <= 160
    ) {

        return value;

    }


    return (
        value.substring(
            0,
            160
        ) +
        "..."
    );

}


/* =====================================================
   LOAD NEWS FROM FIRESTORE
===================================================== */

async function loadNews() {

    if (!newsGrid) {

        console.error(
            "❌ newsGrid পাওয়া যায়নি।"
        );

        return;

    }


    /* Loading */

    newsGrid.innerHTML = `

        <div class="loading-news">

            ⏳ সংবাদ লোড হচ্ছে...

        </div>

    `;


    hideMessage();


    try {

        /*
        Firestore থেকে News Collection নেওয়া হচ্ছে।

        এখানে orderBy ব্যবহার করা হয়নি।
        তাই createdAt না থাকলেও Query Error হবে না।
        */


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "news"
                )
            );


        /* Clear Previous News */

        allNews = [];


        /* Read Documents */

        snapshot.forEach(
            (docSnapshot) => {

                const data =
                    docSnapshot.data();


                allNews.push({

                    id:
                        docSnapshot.id,

                    ...data

                });

            }
        );


        /* Sort Newest First */

        allNews.sort(
            (a, b) => {

                return (
                    getNewsDate(b).getTime()
                    -
                    getNewsDate(a).getTime()
                );

            }
        );


        console.log(
            "✅ News Loaded:",
            allNews.length
        );


        /* Render */

        renderNews();


        /* Success Message */

        if (
            allNews.length > 0
        ) {

            showMessage(
                `✅ ${allNews.length} টি সংবাদ সফলভাবে লোড হয়েছে।`,
                "success"
            );


            setTimeout(
                hideMessage,
                3000
            );

        }


    } catch (error) {

        console.error(
            "❌ Firestore Error:",
            error
        );


        /* Error UI */

        newsGrid.innerHTML = `

            <div class="empty-news">

                <h3>
                    ❌ সংবাদ লোড করা যায়নি
                </h3>

                <br>

                <p>

                    Firebase Firestore সংযোগ
                    অথবা Firestore Rules পরীক্ষা করুন।

                </p>

                <br>

                <button
                    type="button"
                    onclick="location.reload()"
                    style="
                        padding:10px 18px;
                        border:none;
                        border-radius:8px;
                        background:#6a11cb;
                        color:white;
                        cursor:pointer;
                        font-weight:bold;
                    "
                >

                    🔄 আবার চেষ্টা করুন

                </button>

            </div>

        `;


        showMessage(
            "❌ Firebase Firestore সংযোগে সমস্যা হয়েছে।",
            "error"
        );

    }

}


/* =====================================================
   RENDER NEWS
===================================================== */

function renderNews() {

    if (!newsGrid) {

        return;

    }


    /* Search Text */

    const searchText =
        searchBox
            ? searchBox.value
                .trim()
                .toLowerCase()
            : "";


    /* Copy All News */

    let filteredNews =
        [...allNews];


    /* =================================================
       CATEGORY FILTER
    ================================================= */

    if (
        currentCategory !== "all"
    ) {

        filteredNews =
            filteredNews.filter(
                (news) => {

                    const category =
                        String(
                            news.category ||
                            ""
                        )
                        .trim()
                        .toLowerCase();


                    return (
                        category ===
                        currentCategory
                            .trim()
                            .toLowerCase()
                    );

                }
            );

    }


    /* =================================================
       SEARCH FILTER
    ================================================= */

    if (
        searchText
    ) {

        filteredNews =
            filteredNews.filter(
                (news) => {

                    const title =
                        String(
                            news.title ||
                            ""
                        )
                        .toLowerCase();


                    const description =
                        String(
                            news.description ||
                            news.summary ||
                            ""
                        )
                        .toLowerCase();


                    const category =
                        String(
                            news.category ||
                            ""
                        )
                        .toLowerCase();


                    const content =
                        String(
                            news.content ||
                            news.details ||
                            news.body ||
                            ""
                        )
                        .toLowerCase();


                    return (

                        title.includes(
                            searchText
                        )

                        ||

                        description.includes(
                            searchText
                        )

                        ||

                        category.includes(
                            searchText
                        )

                        ||

                        content.includes(
                            searchText
                        )

                    );

                }
            );

    }


    /* =================================================
       UPDATE SECTION TITLE
    ================================================= */

    if (
        newsSectionTitle
    ) {

        if (
            currentCategory === "all"
        ) {

            newsSectionTitle.textContent =
                "📰 সর্বশেষ সংবাদ";

        } else {

            newsSectionTitle.textContent =
                "📰 " +
                (
                    categoryNames[
                        currentCategory
                    ]
                    ||
                    currentCategory
                );

        }

    }


    /* =================================================
       UPDATE SECTION SUBTITLE
    ================================================= */

    if (
        newsSectionSubtitle
    ) {

        if (
            searchText
        ) {

            newsSectionSubtitle.textContent =
                `"${searchText}" এর জন্য ${filteredNews.length} টি সংবাদ পাওয়া গেছে`;

        } else {

            newsSectionSubtitle.textContent =
                `${filteredNews.length} টি সংবাদ পাওয়া গেছে`;

        }

    }


    /* =================================================
       EMPTY RESULT
    ================================================= */

    if (
        filteredNews.length === 0
    ) {

        newsGrid.innerHTML = `

            <div class="empty-news">

                📰 এই বিভাগে কোনো সংবাদ পাওয়া যায়নি।

                <br><br>

                অন্য বিভাগ নির্বাচন করুন
                অথবা নতুন করে Search করুন।

            </div>

        `;

        return;

    }


    /* =================================================
       CLEAR NEWS GRID
    ================================================= */

    newsGrid.innerHTML = "";


    /* =================================================
       CREATE NEWS CARDS
    ================================================= */

    filteredNews.forEach(
        (news) => {

            /* Create Card */

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "news-card";


            /* =========================
               IMAGE
            ========================= */

            const image =
                news.image ||
                news.imageUrl ||
                "assets/news1.jpg";


            /* =========================
               TITLE
            ========================= */

            const title =
                news.title ||
                "শিরোনাম নেই";


            /* =========================
               DESCRIPTION
            ========================= */

            const description =
                createShortDescription(

                    news.description ||

                    news.summary ||

                    news.content ||

                    news.details ||

                    news.body ||

                    "সংবাদের বিস্তারিত তথ্য জানতে বিস্তারিত পড়ুন।"

                );


            /* =========================
               CATEGORY
            ========================= */

            const category =
                news.category ||
                "সাধারণ";


            /* =========================
               DATE
            ========================= */

            const dateText =
                formatDate(news);


            /* =========================
               CARD HTML
            ========================= */

            card.innerHTML = `

                <img
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(title)}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='assets/news1.jpg';
                    "
                >


                <div class="news-card-content">


                    <span class="news-category">

                        ${escapeHTML(category)}

                    </span>


                    <h3>

                        ${escapeHTML(title)}

                    </h3>


                    <p>

                        ${escapeHTML(description)}

                    </p>


                    <div class="news-date">

                        📅 ${escapeHTML(dateText)}

                    </div>


                    <a
                        href="news-details.html?id=${encodeURIComponent(news.id)}"
                        class="read-more-btn"
                    >

                        বিস্তারিত পড়ুন →

                    </a>


                </div>

            `;


            /* Add Card */

            newsGrid.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   CATEGORY SELECT
===================================================== */

function selectCategory(
    category
) {

    currentCategory =
        category ||
        "all";


    /* Clear Search */

    if (
        searchBox
    ) {

        searchBox.value =
            "";

    }


    /* Render */

    renderNews();


    /* Scroll to News */

    const newsSection =
        document.getElementById(
            "news"
        );


    if (
        newsSection
    ) {

        setTimeout(
            () => {

                newsSection.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            },
            100
        );

    }

}


/* =====================================================
   CATEGORY NAVIGATION
===================================================== */

document
    .querySelectorAll(
        "[data-category]"
    )
    .forEach(
        (element) => {

            element.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();


                    const category =
                        element.dataset.category;


                    selectCategory(
                        category
                    );

                }
            );

        }
    );


/* =====================================================
   SEARCH BUTTON
===================================================== */

if (
    searchBtn
) {

    searchBtn.addEventListener(
        "click",
        () => {

            renderNews();


            const newsSection =
                document.getElementById(
                    "news"
                );


            if (
                newsSection
            ) {

                newsSection.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }

        }
    );

}


/* =====================================================
   SEARCH ENTER
===================================================== */

if (
    searchBox
) {

    searchBox.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                renderNews();

            }

        }
    );

}


/* =====================================================
   LIVE SEARCH
===================================================== */

if (
    searchBox
) {

    searchBox.addEventListener(
        "input",
        () => {

            renderNews();

        }
    );

}


/* =====================================================
   REFRESH NEWS
===================================================== */

if (
    refreshBtn
) {

    refreshBtn.addEventListener(
        "click",
        async () => {

            refreshBtn.disabled =
                true;


            refreshBtn.textContent =
                "⏳ Loading...";


            await loadNews();


            refreshBtn.disabled =
                false;


            refreshBtn.textContent =
                "🔄 Refresh";

        }
    );

}


/* =====================================================
   DARK MODE
===================================================== */

function updateDarkButton() {

    if (
        !darkBtn
    ) {

        return;

    }


    if (
        document.body.classList.contains(
            "dark"
        )
    ) {

        darkBtn.textContent =
            "☀️ Light Mode";

    } else {

        darkBtn.textContent =
            "🌙 Dark Mode";

    }

}


/* =====================================================
   DARK MODE BUTTON
===================================================== */

if (
    darkBtn
) {

    darkBtn.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );


            const isDark =
                document.body.classList.contains(
                    "dark"
                );


            localStorage.setItem(
                "dailySheenTheme",
                isDark
                    ? "dark"
                    : "light"
            );


            updateDarkButton();

        }
    );

}


/* =====================================================
   LOAD SAVED THEME
===================================================== */

if (
    localStorage.getItem(
        "dailySheenTheme"
    ) === "dark"
) {

    document.body.classList.add(
        "dark"
    );

}


updateDarkButton();


/* =====================================================
   LIVE CLOCK
===================================================== */

function updateClock() {

    const clock =
        document.getElementById(
            "liveClock"
        );


    const date =
        document.getElementById(
            "liveDate"
        );


    const now =
        new Date();


    /* Time */

    if (
        clock
    ) {

        clock.textContent =
            now.toLocaleTimeString(
                "en-GB"
            );

    }


    /* Date */

    if (
        date
    ) {

        date.textContent =
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


/* Initial Clock */

updateClock();


/* Update Every Second */

setInterval(
    updateClock,
    1000
);


/* =====================================================
   WEATHER DEMO
===================================================== */

const weatherData = [

    {
        temp:
            "31°C",

        status:
            "☀️ Sunny"
    },


    {
        temp:
            "29°C",

        status:
            "⛅ Cloudy"
    },


    {
        temp:
            "27°C",

        status:
            "🌧 Rain"
    },


    {
        temp:
            "30°C",

        status:
            "🌤 Partly Cloudy"
    }

];


let weatherIndex =
    0;


/* =====================================================
   UPDATE WEATHER
===================================================== */

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

        temp.textContent =
            weatherData[
                weatherIndex
            ].temp;


        status.textContent =
            weatherData[
                weatherIndex
            ].status;


        weatherIndex++;


        if (
            weatherIndex >=
            weatherData.length
        ) {

            weatherIndex =
                0;

        }

    }

}


/* Initial Weather */

updateWeather();


/* Change Every 5 Seconds */

setInterval(
    updateWeather,
    5000
);


/* =====================================================
   HERO SLIDER
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
    document.getElementById(
        "heroBanner"
    );


if (
    heroBanner
) {

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
        5000
    );

}


/* =====================================================
   BACK TO TOP
===================================================== */

window.addEventListener(
    "scroll",
    () => {

        if (
            !topBtn
        ) {

            return;

        }


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


/* =====================================================
   BACK TO TOP CLICK
===================================================== */

if (
    topBtn
) {

    topBtn.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top:
                    0,

                behavior:
                    "smooth"

            });

        }
    );

}


/* =====================================================
   SHOW MESSAGE
===================================================== */

function showMessage(
    message,
    type = "error"
) {

    if (
        !newsMessage
    ) {

        return;

    }


    newsMessage.textContent =
        message;


    newsMessage.style.display =
        "block";


    if (
        type === "success"
    ) {

        newsMessage.style.background =
            "#e8f5e9";


        newsMessage.style.color =
            "#087f23";

    } else {

        newsMessage.style.background =
            "#ffebee";


        newsMessage.style.color =
            "#c62828";

    }

}


/* =====================================================
   HIDE MESSAGE
===================================================== */

function hideMessage() {

    if (
        newsMessage
    ) {

        newsMessage.style.display =
            "none";

    }

}


/* =====================================================
   ESCAPE HTML
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
   ESCAPE ATTRIBUTE
===================================================== */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =====================================================
   START APPLICATION
===================================================== */

console.log(
    "✅ Daily Sheen V7 Final App Started"
);


/* Load News */

loadNews();
