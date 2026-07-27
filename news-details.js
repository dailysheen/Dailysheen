// =====================================================
// Daily Sheen V7
// PROFESSIONAL NEWS DETAILS PAGE
// Firebase Firestore
// Related News + Share + Search + Dark Mode
// =====================================================

import { app } from "./firebase-config.js";

import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// FIRESTORE
// =====================================================

const db = getFirestore(app);


// =====================================================
// HTML ELEMENTS
// =====================================================

const newsDetails =
    document.getElementById("newsDetails");

const relatedNews =
    document.getElementById("relatedNews");

const darkBtn =
    document.getElementById("darkBtn");

const searchBox =
    document.getElementById("searchBox");

const searchBtn =
    document.getElementById("searchBtn");

const detailsTopBtn =
    document.getElementById("detailsTopBtn");


// =====================================================
// GET NEWS ID
// URL:
// news-details.html?id=NEWS_ID
// =====================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const newsId =
    urlParams.get("id");


// =====================================================
// GET NEWS DATE
// =====================================================

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
                new Date(
                    news.createdAt
                );

            if (
                !isNaN(
                    date.getTime()
                )
            ) {

                return date;

            }

        }


        return null;

    } catch (error) {

        return null;

    }

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(news) {

    const date =
        getNewsDate(news);


    if (!date) {

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


// =====================================================
// LOAD MAIN NEWS
// =====================================================

async function loadNewsDetails() {

    if (!newsDetails) {

        console.error(
            "❌ newsDetails element পাওয়া যায়নি।"
        );

        return;

    }


    if (!newsId) {

        showError(
            "❌ কোনো সংবাদ নির্বাচন করা হয়নি।"
        );

        return;

    }


    newsDetails.innerHTML = `

        <div class="news-loading">

            ⏳ সংবাদ লোড হচ্ছে...

        </div>

    `;


    try {

        const newsRef =
            doc(
                db,
                "news",
                newsId
            );


        const newsSnapshot =
            await getDoc(
                newsRef
            );


        if (
            !newsSnapshot.exists()
        ) {

            showError(
                "❌ সংবাদটি পাওয়া যায়নি।"
            );

            return;

        }


        const news = {

            id:
                newsSnapshot.id,

            ...newsSnapshot.data()

        };


        console.log(
            "✅ News Details Loaded:",
            news
        );


        displayNews(
            news
        );


        loadRelatedNews(
            news
        );


    } catch (error) {

        console.error(
            "❌ News Details Error:",
            error
        );


        showError(
            "❌ সংবাদ লোড করা যায়নি। Firebase সংযোগ পরীক্ষা করুন।"
        );

    }

}


// =====================================================
// DISPLAY MAIN NEWS
// =====================================================

function displayNews(news) {

    const title =
        news.title ||
        "সংবাদের শিরোনাম পাওয়া যায়নি";


    const category =
        news.category ||
        "সাধারণ";


    const image =
        news.image ||
        news.imageUrl ||
        "assets/news1.jpg";


    const description =
        news.description ||
        news.summary ||
        "";


    const content =
        news.content ||
        news.details ||
        news.body ||
        description ||
        "সংবাদের বিস্তারিত তথ্য পাওয়া যাচ্ছে না।";


    const dateText =
        formatDate(news);


    newsDetails.innerHTML = `

        <!-- =====================================
             CATEGORY
        ====================================== -->

        <span class="news-details-category">

            ${escapeHTML(category)}

        </span>


        <!-- =====================================
             TITLE
        ====================================== -->

        <h1 class="news-details-title">

            ${escapeHTML(title)}

        </h1>


        <!-- =====================================
             META
        ====================================== -->

        <div class="news-details-meta">

            <span>

                📅 প্রকাশিত:

                ${escapeHTML(dateText)}

            </span>


            <span>

                📰 Daily Sheen

            </span>

        </div>


        <!-- =====================================
             FEATURED IMAGE
        ====================================== -->

        <div class="news-details-image-wrapper">

            <img

                src="${escapeAttribute(image)}"

                alt="${escapeAttribute(title)}"

                class="news-details-image"

                loading="eager"

                onerror="
                    this.onerror=null;
                    this.src='assets/news1.jpg';
                "

            >

        </div>


        <!-- =====================================
             NEWS CONTENT
        ====================================== -->

        <div class="news-details-description">

            ${formatNewsContent(content)}

        </div>


        <!-- =====================================
             SHARE AREA
        ====================================== -->

        <div class="news-share-area">

            <div class="news-share-title">

                📤 সংবাদটি শেয়ার করুন

            </div>


            <button

                type="button"

                class="share-btn share-facebook"

                id="shareFacebookBtn"

            >

                📘 Facebook

            </button>


            <button

                type="button"

                class="share-btn share-copy"

                id="copyLinkBtn"

            >

                🔗 Link Copy

            </button>

        </div>


        <!-- =====================================
             BACK BUTTON
        ====================================== -->

        <a

            href="index.html"

            class="back-home-btn"

        >

            ← সকল সংবাদে ফিরে যান

        </a>

    `;


    // =================================================
    // UPDATE PAGE TITLE
    // =================================================

    document.title =
        title +
        " | Daily Sheen";


    // =================================================
    // FACEBOOK SHARE
    // =================================================

    const shareFacebookBtn =
        document.getElementById(
            "shareFacebookBtn"
        );


    if (
        shareFacebookBtn
    ) {

        shareFacebookBtn.addEventListener(
            "click",
            () => {

                const shareURL =
                    window.location.href;


                const facebookURL =
                    "https://www.facebook.com/sharer/sharer.php?u=" +
                    encodeURIComponent(
                        shareURL
                    );


                window.open(

                    facebookURL,

                    "_blank",

                    "width=600,height=500"

                );

            }
        );

    }


    // =================================================
    // COPY LINK
    // =================================================

    const copyLinkBtn =
        document.getElementById(
            "copyLinkBtn"
        );


    if (
        copyLinkBtn
    ) {

        copyLinkBtn.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        window.location.href
                    );


                    const oldText =
                        copyLinkBtn.textContent;


                    copyLinkBtn.textContent =
                        "✅ Link Copied";


                    setTimeout(
                        () => {

                            copyLinkBtn.textContent =
                                oldText;

                        },
                        2000
                    );


                } catch (error) {

                    alert(
                        "লিংক কপি করা সম্ভব হয়নি।"
                    );

                }

            }
        );

    }

}


// =====================================================
// RELATED NEWS
// =====================================================

async function loadRelatedNews(currentNews) {

    if (!relatedNews) {

        return;

    }


    relatedNews.innerHTML = `

        <div class="news-loading">

            ⏳ আরও সংবাদ লোড হচ্ছে...

        </div>

    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "news"
                )
            );


        let newsList = [];


        snapshot.forEach(
            (docSnapshot) => {

                const data =
                    docSnapshot.data();


                if (
                    docSnapshot.id !==
                    currentNews.id
                ) {

                    newsList.push({

                        id:
                            docSnapshot.id,

                        ...data

                    });

                }

            }
        );


        // =================================================
        // SAME CATEGORY FIRST
        // =================================================

        const currentCategory =
            String(
                currentNews.category ||
                ""
            )
            .trim()
            .toLowerCase();


        newsList.sort(
            (a, b) => {

                const aCategory =
                    String(
                        a.category ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                const bCategory =
                    String(
                        b.category ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                const aSame =
                    aCategory ===
                    currentCategory;


                const bSame =
                    bCategory ===
                    currentCategory;


                if (
                    aSame &&
                    !bSame
                ) {

                    return -1;

                }


                if (
                    !aSame &&
                    bSame
                ) {

                    return 1;

                }


                return (
                    getNewsDate(b) || 0
                )
                -
                (
                    getNewsDate(a) || 0
                );

            }
        );


        // =================================================
        // MAX 5 RELATED NEWS
        // =================================================

        newsList =
            newsList.slice(
                0,
                5
            );


        if (
            newsList.length === 0
        ) {

            relatedNews.innerHTML = `

                <div class="empty-related">

                    📰 আরও কোনো সংবাদ পাওয়া যায়নি।

                </div>

            `;

            return;

        }


        // =================================================
        // RENDER RELATED NEWS
        // =================================================

        relatedNews.innerHTML = "";


        newsList.forEach(
            (news) => {

                const image =
                    news.image ||
                    news.imageUrl ||
                    "assets/news1.jpg";


                const title =
                    news.title ||
                    "শিরোনাম নেই";


                const dateText =
                    formatDate(news);


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "related-news-item";


                item.innerHTML = `

                    <img

                        src="${escapeAttribute(image)}"

                        alt="${escapeAttribute(title)}"

                        class="related-news-image"

                        loading="lazy"

                        onerror="
                            this.onerror=null;
                            this.src='assets/news1.jpg';
                        "

                    >


                    <div class="related-news-content">

                        <a

                            href="news-details.html?id=${encodeURIComponent(news.id)}"

                        >

                            <h4>

                                ${escapeHTML(title)}

                            </h4>

                        </a>


                        <div class="related-news-date">

                            📅 ${escapeHTML(dateText)}

                        </div>

                    </div>

                `;


                relatedNews.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "❌ Related News Error:",
            error
        );


        relatedNews.innerHTML = `

            <div class="empty-related">

                ❌ আরও সংবাদ লোড করা যায়নি।

            </div>

        `;

    }

}


// =====================================================
// FORMAT NEWS CONTENT
// =====================================================

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
            /\r\n/g,
            "<br>"
        )
        .replace(
            /\n/g,
            "<br>"
        );

}


// =====================================================
// ERROR MESSAGE
// =====================================================

function showError(
    message
) {

    if (!newsDetails) {

        return;

    }


    newsDetails.innerHTML = `

        <div class="news-error">

            <h2>

                ${escapeHTML(message)}

            </h2>


            <p>

                অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।

            </p>


            <a

                href="index.html"

                class="back-home-btn"

            >

                ← হোম পেজে ফিরে যান

            </a>

        </div>

    `;


    if (relatedNews) {

        relatedNews.innerHTML = `

            <div class="empty-related">

                সংবাদ পাওয়া যায়নি।

            </div>

        `;

    }

}


// =====================================================
// SEARCH
// =====================================================

if (
    searchBtn &&
    searchBox
) {

    searchBtn.addEventListener(
        "click",
        () => {

            const keyword =
                searchBox.value.trim();


            if (
                !keyword
            ) {

                searchBox.focus();

                return;

            }


            window.location.href =
                "index.html?search=" +
                encodeURIComponent(
                    keyword
                );

        }
    );


    searchBox.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                searchBtn.click();

            }

        }
    );

}


// =====================================================
// DARK MODE
// =====================================================

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


// =====================================================
// DARK MODE BUTTON
// =====================================================

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


// =====================================================
// RESTORE DARK MODE
// =====================================================

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


// =====================================================
// BACK TO TOP
// =====================================================

window.addEventListener(
    "scroll",
    () => {

        if (
            !detailsTopBtn
        ) {

            return;

        }


        if (
            window.scrollY >
            400
        ) {

            detailsTopBtn.style.display =
                "flex";

        } else {

            detailsTopBtn.style.display =
                "none";

        }

    }
);


// =====================================================
// BACK TO TOP CLICK
// =====================================================

if (
    detailsTopBtn
) {

    detailsTopBtn.addEventListener(
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


// =====================================================
// ESCAPE HTML
// =====================================================

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

       
