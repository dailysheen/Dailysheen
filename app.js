/* =====================================================
   Daily Sheen V7
   Final App JS
   Firebase News + Search + Category + Dark Mode
===================================================== */


/* =====================================================
   FIREBASE IMPORT
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
   FIREBASE INITIALIZE
===================================================== */

const db = getFirestore(app);


/* =====================================================
   HTML ELEMENTS
===================================================== */

const latestNewsGrid =
  document.getElementById("latestNewsGrid");

const featuredNewsGrid =
  document.getElementById("featuredNewsGrid");

const newsSectionTitle =
  document.getElementById("newsSectionTitle");

const newsSectionSubtitle =
  document.getElementById("newsSectionSubtitle");

const firebaseMessage =
  document.getElementById("firebaseMessage");

const searchBox =
  document.getElementById("searchBox");

const searchBtn =
  document.getElementById("searchBtn");

const darkBtn =
  document.getElementById("darkBtn");

const topBtn =
  document.getElementById("topBtn");

const refreshNewsBtn =
  document.getElementById("refreshNewsBtn");

const breakingText =
  document.getElementById("breakingText");


/* =====================================================
   GLOBAL NEWS ARRAY
===================================================== */

let allNews = [];

let currentCategory = "all";

let currentSearch = "";


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =====================================================
   SHOW MESSAGE
===================================================== */

function showFirebaseMessage(
  message,
  type = "info"
) {

  if (!firebaseMessage) {
    return;
  }

  firebaseMessage.style.display =
    "block";

  firebaseMessage.textContent =
    message;

  if (type === "error") {

    firebaseMessage.style.color =
      "#b71c1c";

    firebaseMessage.style.background =
      "#ffebee";

  } else {

    firebaseMessage.style.color =
      "#555";

    firebaseMessage.style.background =
      "#fff";

  }

}


/* =====================================================
   LOAD NEWS FROM FIREBASE
===================================================== */

async function loadNews() {

  if (!latestNewsGrid) {
    return;
  }

  latestNewsGrid.innerHTML = `
    <div class="loading-news">
      ⏳ Firebase থেকে সংবাদ লোড হচ্ছে...
    </div>
  `;

  showFirebaseMessage(
    "⏳ সংবাদ লোড হচ্ছে..."
  );

  try {

    const newsQuery = query(
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
            data.category || "",

          title:
            data.title || "",

          description:
            data.description || "",

          image:
            data.image || "",

          createdAt:
            data.createdAt || null

        });

      }
    );


    console.log(
      "Firebase News Loaded:",
      allNews.length
    );


    if (
      allNews.length === 0
    ) {

      latestNewsGrid.innerHTML = `
        <div class="no-news">
          📰 এখনো কোনো সংবাদ প্রকাশ করা হয়নি।
        </div>
      `;

      if (featuredNewsGrid) {

        featuredNewsGrid.innerHTML = `
          <div class="no-news">
            ⭐ Featured News পাওয়া যায়নি।
          </div>
        `;

      }

      showFirebaseMessage(
        "ℹ️ এখনো কোনো News Publish করা হয়নি।"
      );

      return;

    }


    showFirebaseMessage(
      `✅ মোট ${allNews.length}টি সংবাদ পাওয়া গেছে।`
    );


    renderNews();

    renderFeaturedNews();


    updateBreakingNews();


  } catch (error) {

    console.error(
      "Firebase News Error:",
      error
    );


    latestNewsGrid.innerHTML = `

      <div class="no-news">

        ❌ সংবাদ লোড করা যায়নি।

        <br><br>

        <small>
          Firebase Firestore সংযোগ বা Rules পরীক্ষা করুন।
        </small>

      </div>

    `;


    if (featuredNewsGrid) {

      featuredNewsGrid.innerHTML = `

        <div class="no-news">

          ❌ Featured News লোড করা যায়নি।

        </div>

      `;

    }


    showFirebaseMessage(
      "❌ Firebase Firestore সংযোগে সমস্যা হয়েছে।",
      "error"
    );

  }

}


/* =====================================================
   FILTER NEWS
===================================================== */

function getFilteredNews() {

  let filtered =
    [...allNews];


  /* CATEGORY */

  if (
    currentCategory !== "all"
  ) {

    filtered =
      filtered.filter(
        news =>

        news.category.trim()
          .toLowerCase()

        ===

        currentCategory.trim()
          .toLowerCase()
      );

  }


  /* SEARCH */

  if (
    currentSearch
  ) {

    filtered =
      filtered.filter(
        news => {

          const text = (

            news.title +
            " " +
            news.description +
            " " +
            news.category

          )
          .toLowerCase();


          return text.includes(
            currentSearch
          );

        }
      );

  }


  return filtered;

}


/* =====================================================
   RENDER NEWS
===================================================== */

function renderNews() {

  if (!latestNewsGrid) {
    return;
  }


  const filteredNews =
    getFilteredNews();


  if (
    filteredNews.length === 0
  ) {

    latestNewsGrid.innerHTML = `

      <div class="no-news">

        🔍 এই ক্যাটাগরি বা সার্চের জন্য
        কোনো সংবাদ পাওয়া যায়নি।

      </div>

    `;

    return;

  }


  latestNewsGrid.innerHTML = "";


  filteredNews.forEach(
    (news) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "news-card";


      let imageHTML = "";


      if (
        news.image
      ) {

        imageHTML = `

          <img
            src="${escapeHTML(
              news.image
            )}"
            alt="${escapeHTML(
              news.title
            )}"
            loading="lazy"
            onerror="this.style.display='none'"
          >

        `;

      } else {

        imageHTML = `

          <div
            style="
              height:210px;
              display:flex;
              align-items:center;
              justify-content:center;
              background:linear-gradient(135deg,#6a11cb,#2575fc);
              color:white;
              font-size:40px;
            "
          >
            📰
          </div>

        `;

      }


      let dateText =
        "সাম্প্রতিক";


      if (
        news.createdAt &&
        typeof news.createdAt.toDate
          === "function"
      ) {

        dateText =
          news.createdAt
            .toDate()
            .toLocaleString(
              "bn-BD"
            );

      }


      card.innerHTML = `

        ${imageHTML}

        <div class="news-card-content">

          <span class="news-category">

            ${escapeHTML(
              news.category ||
              "সাধারণ"
            )}

          </span>


          <h3>

            ${escapeHTML(
              news.title ||
              "সংবাদের শিরোনাম"
            )}

          </h3>


          <p>

            ${escapeHTML(
              news.description ||
              ""
            )}

          </p>


          <div class="news-date">

            📅 ${escapeHTML(
              dateText
            )}

          </div>

        </div>

      `;


      latestNewsGrid.appendChild(
        card
      );

    }
  );

}


/* =====================================================
   FEATURED NEWS
===================================================== */

function renderFeaturedNews() {

  if (!featuredNewsGrid) {
    return;
  }


  const featured =
    allNews.slice(
      0,
      2
    );


  if (
    featured.length === 0
  ) {

    featuredNewsGrid.innerHTML = `
      <div class="no-news">
        ⭐ Featured News নেই।
      </div>
    `;

    return;

  }


  featuredNewsGrid.innerHTML = "";


  featured.forEach(
    (news) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "featured-card";


      const image =
        news.image
        ?

        `

        <img
          src="${escapeHTML(
            news.image
          )}"
          alt="${escapeHTML(
            news.title
          )}"
          loading="lazy"
        >

        `

        :

        `

        <div
          style="
            height:260px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:linear-gradient(135deg,#6a11cb,#2575fc);
            color:white;
            font-size:50px;
          "
        >
          📰
        </div>

        `;


      card.innerHTML = `

        ${image}

        <div class="featured-content">

          <span class="news-category">

            ${escapeHTML(
              news.category ||
              "সাধারণ"
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

        </div>

      `;


      featuredNewsGrid.appendChild(
        card
      );

    }
  );

}


/* =====================================================
   CATEGORY MENU
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


          currentCategory =
            element.dataset.category
            || "all";


          currentSearch =
            "";


          if (searchBox) {

            searchBox.value =
              "";

          }


          /* Active Menu */

          document
            .querySelectorAll(
              ".main-nav a[data-category]"
            )
            .forEach(
              link => {

                link.classList.remove(
                  "active"
                );

              }
            );


          document
            .querySelectorAll(
              `.main-nav a[data-category="${currentCategory}"]`
            )
            .forEach(
              link => {

                link.classList.add(
                  "active"
                );

              }
            );


          /* Title */

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
                `📰 ${currentCategory} সংবাদ`;

            }

          }


          if (
            newsSectionSubtitle
          ) {

            if (
              currentCategory ===
              "all"
            ) {

              newsSectionSubtitle.textContent =
                "সকল বিভাগের সর্বশেষ সংবাদ";

            } else {

              newsSectionSubtitle.textContent =
                `${currentCategory} বিভাগের সর্বশেষ সংবাদ`;

            }

          }


          renderNews();


          const newsSection =
            document.getElementById(
              "latestNewsGrid"
            );


          if (newsSection) {

            newsSection.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

          }

        }
      );

    }
  );


/* =====================================================
   CATEGORY CARDS
===================================================== */

document
  .querySelectorAll(
    ".category-card[data-category]"
  )
  .forEach(
    (card) => {

      card.addEventListener(
        "click",
        () => {

          const category =
            card.dataset.category;


          currentCategory =
            category;


          currentSearch =
            "";


          if (searchBox) {

            searchBox.value =
              "";

          }


          if (
            newsSectionTitle
          ) {

            newsSectionTitle.textContent =
              `📰 ${category} সংবাদ`;

          }


          if (
            newsSectionSubtitle
          ) {

            newsSectionSubtitle.textContent =
              `${category} বিভাগের সর্বশেষ সংবাদ`;

          }


          renderNews();


          document
            .getElementById(
              "latestNewsGrid"
            )
            ?.scrollIntoView({
              behavior: "smooth"
            });

        }
      );

    }
  );


/* =====================================================
   SEARCH FUNCTION
===================================================== */

function performSearch() {

  currentSearch =
    searchBox
      ? searchBox.value
          .trim()
          .toLowerCase()
      : "";


  currentCategory =
    "all";


  document
    .querySelectorAll(
      ".main-nav a[data-category]"
    )
    .forEach(
      link => {

        link.classList.remove(
          "active"
        );

      }
    );


  if (
    newsSectionTitle
  ) {

    newsSectionTitle.textContent =
      currentSearch

      ?

      `🔍 "${currentSearch}" - সার্চ ফলাফল`

      :

      "📰 সর্বশেষ সংবাদ";

  }


  if (
    newsSectionSubtitle
  ) {

    newsSectionSubtitle.textContent =
      "আপনার সার্চ অনুযায়ী সংবাদ";

  }


  renderNews();

}


/* Search Button */

if (
  searchBtn
) {

  searchBtn.addEventListener(
    "click",
    performSearch
  );

}


/* Enter Search */

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

        performSearch();

      }

    }
  );

}


/* =====================================================
   REFRESH NEWS
===================================================== */

if (
  refreshNewsBtn
) {

  refreshNewsBtn.addEventListener(
    "click",
    async () => {

      await loadNews();

    }
  );

}


/* =====================================================
   DARK MODE
===================================================== */

if (
  darkBtn
) {

  darkBtn.addEventListener(
    "click",
    () => {

      document.body
        .classList
        .toggle(
          "dark"
        );


      const isDark =
        document.body
          .classList
          .contains(
            "dark"
          );


      if (
        isDark
      ) {

        darkBtn.textContent =
          "☀️ Light Mode";


        localStorage.setItem(
          "theme",
          "dark"
        );

      } else {

        darkBtn.textContent =
          "🌙 Dark Mode";


        localStorage.setItem(
          "theme",
          "light"
        );

      }

    }
  );

}


/* Load Saved Theme */

if (
  localStorage.getItem(
    "theme"
  )
  ===
  "dark"
) {

  document.body
    .classList
    .add(
      "dark"
    );


  if (
    darkBtn
  ) {

    darkBtn.textContent =
      "☀️ Light Mode";

  }

}


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


setInterval(
  updateClock,
  1000
);

updateClock();


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


      heroBanner.style.opacity =
        "0";


      setTimeout(
        () => {

          heroBanner.src =
            heroImages[
              heroIndex
            ];


          heroBanner.style.opacity =
            "1";

        },
        300
      );

    },
    5000
  );

}


/* =====================================================
   BREAKING NEWS
===================================================== */

const breakingNews =
  [

    "বাংলাদেশের সর্বশেষ সংবাদ দেখুন Daily Sheen-এ",

    "স্বাস্থ্য ও চিকিৎসা বিষয়ক নতুন তথ্য প্রকাশিত হয়েছে",

    "প্রযুক্তির নতুন আপডেট জানতে আমাদের সাথে থাকুন",

    "খেলাধুলার সর্বশেষ খবর এখন Daily Sheen-এ"

  ];


let breakingIndex =
  0;


if (
  breakingText
) {

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


      breakingText.textContent =
        breakingNews[
          breakingIndex
        ];

    },
    6000
  );

}


/* =====================================================
   BACK TO TOP
===================================================== */

window.addEventListener(
  "scroll",
  () => {

    if (
      window.scrollY >
      400
    ) {

      if (
        topBtn
      ) {

        topBtn.style.display =
          "block";

      }

    } else {

      if (
        topBtn
      ) {

        topBtn.style.display =
          "none";

      }

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
   START APPLICATION
===================================================== */

console.log(
  "✅ Daily Sheen V7 App Started"
);


/* Firebase News Load */

loadNews();
