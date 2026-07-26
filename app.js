/* =====================================================
   Daily Sheen V7
   FINAL app.js
   Firebase Firestore News
   Category + Search + Details Modal
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

        if (
            news.createdAt &&
            typeof news.createdAt.toDate === "function"
        ) {

            return news.createdAt.toDate();

        }

        if (
            news.createdAt instanceof Date
        ) {

            return news.createdAt;

        }

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

        return new Date(0);

    } catch (error) {

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
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );

    } catch (error) {

        return "সাম্প্রতিক";

    }

}


/* =====================================================
   LOAD NEWS FROM FIRESTORE
===================================================== */

async function loadNews() {

    if (!newsGrid) {

        console.error(
            "newsGrid পাওয়া যায়নি।"
        );

        return;

    }


    newsGrid.innerHTML = `

        <div class="loading-news">

            ⏳ সংবাদ লোড হচ্ছে...

        </div>

    `;


    hideMessage();


    try {

        /*
        এখানে orderBy ব্যবহার করা হয়নি।

        তাই কোনো সংবাদে createdAt না থাকলেও
        Firestore Query Error হবে না।
        */


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "news"
                )
            );


        allNews = [];


        snapshot.forEach(
            (doc) => {

                const data =
                    doc.data();


                allNews.push({

                    id:
                        doc.id,

                    ...data

                });

            }
        );


        /*
        নতুন সংবাদ আগে দেখানো হবে
        */


        allNews.sort(
            (a, b) => {

                return (
                    getNewsDate(b)
                    -
                    getNewsDate(a)
                );

            }
        );


        console.log(
            "✅ News Loaded:",
            allNews.length
        );


        renderNews();


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


        newsGrid.innerHTML = `

            <div class="empty-news">

                ❌ সংবাদ লোড করা যায়নি।

                <br><br>

                <small>

                    Firebase Firestore সংযোগ
                    অথবা Firestore Rules পরীক্ষা করুন।

                </small>

                <br><br>

                <button
                    onclick="location.reload()"
                    style="
                        padding:10px 18px;
                        border:none;
                        border-radius:8px;
                        background:#6a11cb;
                        color:white;
                        cursor:pointer;
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


    const searchText =
        searchBox
            ? searchBox.value
                .trim()
                .toLowerCase()
            : "";


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
       UPDATE TITLE
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
                    ] ||
                    currentCategory
                );

        }

    }


    /* =================================================
       UPDATE SUBTITLE
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
       CLEAR GRID
    ================================================= */

    newsGrid.innerHTML = "";


    /* =================================================
       CREATE NEWS CARDS
    ================================================= */

    filteredNews.forEach(
        (news) => {

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
                news.description ||
                news.summary ||
                "সংবাদের বিস্তারিত তথ্য জানতে বিস্তারিত পড়ুন।";


            /* =========================
               CATEGORY
            ========================= */

            const category =
                news.category ||
                "সাধারণ";


            /* =========================
               FULL CONTENT
            ========================= */

            const fullContent =
                news.content ||
                news.details ||
                news.body ||
                news.description ||
                "এই সংবাদের বিস্তারিত তথ্য বর্তমানে পাওয়া যাচ্ছে না।";


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
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(title)}"
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

                        ${escapeHTML(
                            createShortDescription(
                                description
                            )
                        )}

                    </p>


                    <div class="news-date">

                        📅 ${escapeHTML(dateText)}

                    </div>


                    <button
                        class="read-more-btn"
                        type="button"
                    >

                        বিস্তারিত পড়ুন →

                    </button>


                </div>

            `;


            /* =================================================
               DETAILS BUTTON
            ================================================= */

            const readMoreBtn =
                card.querySelector(
                    ".read-more-btn"
                );


            if (
                readMoreBtn
            ) {

                readMoreBtn.addEventListener(
                    "click",
                    () => {

                        openNewsDetails(
                            news
                        );

                    }
                );

            }


            newsGrid.appendChild(
                card
            );

        }
    );

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
        );


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
   NEWS DETAILS MODAL
===================================================== */

function openNewsDetails(
    news
) {

    let modal =
        document.getElementById(
            "newsDetailsModal"
        );


    /*
    Modal না থাকলে তৈরি করবে
    */


    if (
        !modal
    ) {

        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "newsDetailsModal";


        modal.className =
            "news-details-modal";


        document.body.appendChild(
            modal
        );


        /* Close on background */

        modal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    modal
                ) {

                    closeNewsDetails();

                }

            }
        );

    }


    const image =
        news.image ||
        news.imageUrl ||
        "assets/news1.jpg";


    const title =
        news.title ||
        "শিরোনাম নেই";


    const category =
        news.category ||
        "সাধারণ";


    const content =
        news.content ||
        news.details ||
        news.body ||
        news.description ||
        "সংবাদের বিস্তারিত তথ্য পাওয়া যাচ্ছে না।";


    const dateText =
        formatDate(news);


    modal.innerHTML = `

        <div class="news-details-box">


            <button
                class="news-details-close"
                type="button"
                aria-label="Close"
            >

                ✕

            </button>


            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(title)}"
                onerror="
                    this.onerror=null;
                    this.src='assets/news1.jpg';
                "
            >


            <div class="news-details-content">


                <span class="news-category">

                    ${escapeHTML(category)}

                </span>


                <h2>

                    ${escapeHTML(title)}

                </h2>


                <div class="news-date">

                    📅 ${escapeHTML(dateText)}

                </div>


                <div class="news-full-content">

                    ${formatNewsContent(
                        content
                    )}

                </div>


            </div>

        </div>

    `;


    modal.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";


    const closeBtn =
        modal.querySelector(
            ".news-details-close"
        );


    if (
        closeBtn
    ) {

        closeBtn.addEventListener(
            "click",
            closeNewsDetails
        );

    }

}


/* =====================================================
   CLOSE NEWS DETAILS
===================================================== */

function closeNewsDetails() {

    const modal =
        document.getElementById(
            "newsDetailsModal"
        );


    if (
        modal
    ) {

        modal.style.display =
            "none";

    }


    document.body.style.overflow =
        "";

}


/* =====================================================
   FORMAT NEWS CONTENT
===================================================== */

function formatNewsContent(
    content
) {

    const safeText =
        escapeHTML(
            String(
                content ||
                ""
            )
        );


    return safeText
        .replace(
            /\n/g,
            "<br>"
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


    renderNews();


    /* Scroll News */

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
   NAVIGATION CLICK
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
                event.key ===
                "Enter"
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
   REFRESH
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


/* Load Saved Theme */

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


    if (
        clock
    ) {

        clock.textContent =
            now.toLocaleTimeString(
                "en-GB"
            );

    }


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


updateClock();


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


updateWeather();


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
   MESSAGE
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
   KEYBOARD ESCAPE
===================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            closeNewsDetails();

        }

    }
);


/* =====================================================
   START APPLICATION
===================================================== */

console.log(
    "✅ Daily Sheen V7 Final App Started"
);


loadNews();
