/* =====================================================
   Daily Sheen V7
   Final app.js
   Firebase Firestore News + Category + Search
===================================================== */


import { app } from "./firebase-config.js";


import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



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
    document.getElementById(
        "newsGrid"
    );


const newsMessage =
    document.getElementById(
        "newsMessage"
    );


const newsSectionTitle =
    document.getElementById(
        "newsSectionTitle"
    );


const newsSectionSubtitle =
    document.getElementById(
        "newsSectionSubtitle"
    );


const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );


const searchBox =
    document.getElementById(
        "searchBox"
    );


const searchBtn =
    document.getElementById(
        "searchBtn"
    );


const darkBtn =
    document.getElementById(
        "darkBtn"
    );


const topBtn =
    document.getElementById(
        "topBtn"
    );



/* =====================================================
   CATEGORY NAMES
===================================================== */

const categoryNames = {

    "all":
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
   LOAD NEWS FROM FIRESTORE
===================================================== */

async function loadNews() {


    if (!newsGrid) {
        return;
    }


    newsGrid.innerHTML = `

        <div class="loading-news">

            ⏳ সংবাদ লোড হচ্ছে...

        </div>

    `;


    hideMessage();


    try {


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


        console.log(
            "News Loaded:",
            allNews.length
        );


        renderNews();


    } catch (error) {


        console.error(
            "Firestore Error:",
            error
        );


        newsGrid.innerHTML = `

            <div class="empty-news">

                ❌ সংবাদ লোড করা যায়নি।

                <br><br>

                <small>

                    Firebase Firestore সংযোগ পরীক্ষা করুন।

                </small>

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



    /* =========================
       CATEGORY FILTER
    ========================= */

    if (
        currentCategory !==
        "all"
    ) {


        filteredNews =
            filteredNews.filter(
                (news) => {

                    const category =
                        String(
                            news.category ||
                            ""
                        ).trim();


                    return (
                        category ===
                        currentCategory
                    );

                }
            );

    }



    /* =========================
       SEARCH FILTER
    ========================= */

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
                        ).toLowerCase();


                    const description =
                        String(
                            news.description ||
                            ""
                        ).toLowerCase();


                    const category =
                        String(
                            news.category ||
                            ""
                        ).toLowerCase();


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

                    );

                }
            );

    }



    /* =========================
       UPDATE TITLE
    ========================= */

    if (
        newsSectionTitle
    ) {


        if (
            currentCategory ===
            "all"
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



    /* =========================
       UPDATE SUBTITLE
    ========================= */

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



    /* =========================
       EMPTY RESULT
    ========================= */

    if (
        filteredNews.length ===
        0
    ) {


        newsGrid.innerHTML = `

            <div class="empty-news">

                📰 এই বিভাগে কোনো সংবাদ পাওয়া যায়নি।

            </div>

        `;


        return;

    }



    /* =========================
       CREATE NEWS CARDS
    ========================= */

    newsGrid.innerHTML = "";


    filteredNews.forEach(
        (news) => {


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "news-card";


            /* IMAGE */

            const image =
                news.image
                    ? escapeHTML(
                        news.image
                    )
                    : "assets/news1.jpg";



            /* TITLE */

            const title =
                escapeHTML(
                    news.title ||
                    "শিরোনাম নেই"
                );



            /* DESCRIPTION */

            const description =
                escapeHTML(
                    news.description ||
                    "সংবাদের বিস্তারিত তথ্য পাওয়া যায়নি।"
                );



            /* CATEGORY */

            const category =
                escapeHTML(
                    news.category ||
                    "সাধারণ"
                );



            /* DATE */

            let dateText =
                "সাম্প্রতিক";


            if (
                news.createdAt &&
                typeof news.createdAt.toDate ===
                "function"
            ) {


                try {


                    dateText =
                        news.createdAt
                            .toDate()
                            .toLocaleString(
                                "bn-BD"
                            );


                } catch (
                    error
                ) {


                    console.log(
                        "Date Error:",
                        error
                    );


                }

            }



            /* CARD HTML */

            card.innerHTML = `

                <img

                    src="${image}"

                    alt="${title}"

                    loading="lazy"

                    onerror="this.src='assets/news1.jpg'"

                >


                <div class="news-card-content">


                    <span class="news-category">

                        ${category}

                    </span>


                    <h3>

                        ${title}

                    </h3>


                    <p>

                        ${description}

                    </p>


                    <div class="news-date">

                        📅 ${dateText}

                    </div>


                </div>

            `;


            newsGrid.appendChild(
                card
            );


        }
    );

}



/* =====================================================
   CATEGORY MENU
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
                        "smooth"

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
    ) ===
    "dark"
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
        type ===
        "success"
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
        value ===
        null ||
        value ===
        undefined
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
   START APPLICATION
===================================================== */

console.log(
    "✅ Daily Sheen V7 App Started"
);


loadNews();
