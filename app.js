/* =====================================================
   Daily Sheen V7
   FINAL app.js
   Firebase News + Search + Category Filter
   News Details + Dark Mode + Clock + Slider
===================================================== */


/* =====================================================
   1. FIREBASE IMPORT
===================================================== */

import { app } from "./firebase-config.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =====================================================
   2. FIREBASE INITIALIZE
===================================================== */

const db = getFirestore(app);


/* =====================================================
   3. GLOBAL VARIABLES
===================================================== */

let allNews = [];

let currentCategory = "all";

let currentSearch = "";


/* =====================================================
   4. HTML ELEMENTS
===================================================== */

const darkBtn =
  document.getElementById("darkBtn");

const searchInput =
  document.getElementById("searchBox");

const searchBtn =
  document.getElementById("searchBtn");

const topBtn =
  document.getElementById("topBtn");


/* =====================================================
   5. DARK MODE
===================================================== */

function applyTheme() {

  const savedTheme =
    localStorage.getItem("theme");

  if (
    savedTheme === "dark"
  ) {

    document.body.classList.add("dark");

    if (darkBtn) {

      darkBtn.innerHTML =
        "☀️ Light Mode";

    }

  } else {

    document.body.classList.remove("dark");

    if (darkBtn) {

      darkBtn.innerHTML =
        "🌙 Dark Mode";

    }

  }

}


applyTheme();


if (darkBtn) {

  darkBtn.addEventListener(
    "click",
    () => {

      document.body.classList.toggle(
        "dark"
      );


      if (
        document.body.classList.contains(
          "dark"
        )
      ) {

        localStorage.setItem(
          "theme",
          "dark"
        );

        darkBtn.innerHTML =
          "☀️ Light Mode";

      } else {

        localStorage.setItem(
          "theme",
          "light"
        );

        darkBtn.innerHTML =
          "🌙 Dark Mode";

      }

    }
  );

}


/* =====================================================
   6. LIVE CLOCK
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

    clock.textContent =
      now.toLocaleTimeString(
        "en-GB"
      );

  }


  if (date) {

    date.textContent =
      now.toLocaleDateString(
        "bn-BD",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
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
   7. WEATHER DEMO
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

      weatherIndex = 0;

    }

  }

}


updateWeather();


setInterval(
  updateWeather,
  5000
);


/* =====================================================
   8. FIREBASE NEWS LOAD
===================================================== */

async function loadFirebaseNews() {

  const newsContainer =
    document.getElementById(
      "firebaseNews"
    );


  if (!newsContainer) {

    console.warn(
      "firebaseNews container পাওয়া যায়নি।"
    );

    return;

  }


  newsContainer.innerHTML = `

    <div class="news-loading">

      ⏳ সংবাদ লোড হচ্ছে...

    </div>

  `;


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
      (newsDoc) => {

        allNews.push({

          id:
            newsDoc.id,

          ...newsDoc.data()

        });

      }
    );


    console.log(
      "Firebase News:",
      allNews
    );


    if (
      allNews.length === 0
    ) {

      newsContainer.innerHTML = `

        <div class="news-empty">

          📰 এখনো কোনো সংবাদ প্রকাশ করা হয়নি।

        </div>

      `;

      return;

    }


    renderNews();

  } catch (error) {

    console.error(
      "Firebase News Load Error:",
      error
    );


    newsContainer.innerHTML = `

      <div class="news-error">

        <h3>
          ❌ সংবাদ লোড করা যায়নি
        </h3>

        <p>
          Firebase Firestore সংযোগ পরীক্ষা করুন।
        </p>

        <small>
          ${escapeHTML(
            error.message
          )}
        </small>

      </div>

    `;

  }

}


/* =====================================================
   9. RENDER NEWS
===================================================== */

function renderNews() {

  const newsContainer =
    document.getElementById(
      "firebaseNews"
    );


  if (!newsContainer) {

    return;

  }


  let filteredNews =
    [...allNews];


  /* CATEGORY FILTER */

  if (
    currentCategory !==
    "all"
  ) {

    filteredNews =
      filteredNews.filter(
        (news) =>

          String(
            news.category ||
            ""
          ).trim() ===
          currentCategory

      );

  }


  /* SEARCH FILTER */

  if (
    currentSearch
  ) {

    const searchText =
      currentSearch.toLowerCase();


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


  /* NO RESULT */

  if (
    filteredNews.length === 0
  ) {

    newsContainer.innerHTML = `

      <div class="news-empty">

        🔍 আপনার অনুসন্ধানের সাথে
        কোনো সংবাদ পাওয়া যায়নি।

      </div>

    `;

    return;

  }


  /* CREATE NEWS HTML */

  newsContainer.innerHTML =
    filteredNews
      .map(
        (news) =>
          createNewsCard(
            news
          )
      )
      .join("");


  /* ANIMATION */

  document
    .querySelectorAll(
      "#firebaseNews .news-card"
    )
    .forEach(
      (card) => {

        card.style.opacity =
          "0";

        card.style.transform =
          "translateY(20px)";


        setTimeout(
          () => {

            card.style.opacity =
              "1";

            card.style.transform =
              "translateY(0)";

          },
          50
        );

      }
    );

}


/* =====================================================
   10. CREATE NEWS CARD
===================================================== */

function createNewsCard(news) {

  let dateText =
    "সম্প্রতি প্রকাশিত";


  if (
    news.createdAt &&
    typeof news.createdAt.toDate ===
      "function"
  ) {

    dateText =
      news.createdAt
        .toDate()
        .toLocaleDateString(
          "bn-BD",
          {
            year: "numeric",
            month: "long",
            day: "numeric"
          }
        );

  }


  const imageHTML =
    news.image
      ? `

        <img

          src="${escapeHTML(
            news.image
          )}"

          alt="${escapeHTML(
            news.title ||
            "Daily Sheen News"
          )}"

          loading="lazy"

          onerror="
            this.style.display='none'
          "

        >

      `
      : `

        <div class="no-news-image">

          📰 Daily Sheen

        </div>

      `;


  return `

    <article
      class="news-card"
    >


      ${imageHTML}


      <div
        class="news-card-content"
      >


        <span
          class="news-category"
        >

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


        <small>

          📅 ${dateText}

        </small>


        <a

          href="news-details.html?id=${encodeURIComponent(
            news.id
          )}"

          class="read-more-btn"

        >

          বিস্তারিত পড়ুন →

        </a>


      </div>


    </article>

  `;

}


/* =====================================================
   11. SEARCH FUNCTION
===================================================== */

function performSearch() {

  if (!searchInput) {

    return;

  }


  currentSearch =
    searchInput.value.trim();


  renderNews();


  const newsSection =
    document.getElementById(
      "firebaseNews"
    );


  if (
    newsSection &&
    currentSearch
  ) {

    newsSection.scrollIntoView(
      {
        behavior: "smooth",
        block: "start"
      }
    );

  }

}


if (searchBtn) {

  searchBtn.addEventListener(
    "click",
    performSearch
  );

}


if (searchInput) {

  searchInput.addEventListener(
    "keyup",
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
   12. CATEGORY FILTER
===================================================== */

function filterByCategory(
  category
) {

  currentCategory =
    category;

  renderNews();


  const newsSection =
    document.getElementById(
      "firebaseNews"
    );


  if (newsSection) {

    newsSection.scrollIntoView(
      {
        behavior: "smooth",
        block: "start"
      }
    );

  }

}


/* =====================================================
   13. CATEGORY NAVIGATION
===================================================== */

document
  .querySelectorAll(
    "nav a"
  )
  .forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          const href =
            link.getAttribute(
              "href"
            );


          if (
            href &&
            href.includes(
              "?category="
            )
          {

            event.preventDefault();


            const category =
              decodeURIComponent(
                href.split(
                  "?category="
                )[1]
              );


            filterByCategory(
              category
            );

          }

        }
      );

    }
  );


/* =====================================================
   14. CATEGORY CARDS
===================================================== */

document
  .querySelectorAll(
    ".category-card"
  )
  .forEach(
    (card) => {

      card.style.cursor =
        "pointer";


      card.addEventListener(
        "click",
        () => {

          const category =
            card.textContent
              .replace(
                /🇧🇩|🌍|🏛|🏥|💊|💻|⚽|💼/g,
                ""
              )
              .trim();


          filterByCategory(
            category
          );

        }
      );

    }
  );


/* =====================================================
   15. URL CATEGORY / SEARCH
===================================================== */

function readURLFilters() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const category =
    params.get(
      "category"
    );


  const search =
    params.get(
      "search"
    );


  if (category) {

    currentCategory =
      category;

  }


  if (search) {

    currentSearch =
      search;


    if (searchInput) {

      searchInput.value =
        search;

    }

  }

}


/* =====================================================
   16. HERO SLIDER
===================================================== */

const heroImages = [

  "assets/banner.png",

  "assets/news1.jpg",

  "assets/news2.jpg",

  "assets/news3.jpg"

];


let heroIndex = 0;


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

        heroIndex = 0;

      }


      heroBanner.style.opacity =
        "0.4";


      setTimeout(
        () => {

          heroBanner.src =
            heroImages[
              heroIndex
            ];


          heroBanner.style.opacity =
            "1";

        },
        200
      );

    },
    4000
  );

}


/* =====================================================
   17. BACK TO TOP
===================================================== */

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


  topBtn.addEventListener(
    "click",
    () => {

      window.scrollTo(
        {
          top: 0,
          behavior: "smooth"
        }
      );

    }
  );

}


/* =====================================================
   18. NEWSLETTER
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
        "ধন্যবাদ! আপনার Newsletter Subscription গ্রহণ করা হয়েছে।"
      );


      newsletterForm.reset();

    }
  );

}


/* =====================================================
   19. BREAKING NEWS
===================================================== */

const breakingText =
  document.querySelector(
    ".breaking-scroll marquee"
  );


const breakingNews = [

  "বাংলাদেশের সর্বশেষ সংবাদ দেখুন Daily Sheen-এ",

  "স্বাস্থ্য ও চিকিৎসা বিষয়ক নতুন তথ্য প্রকাশিত হয়েছে",

  "প্রযুক্তির নতুন আপডেট জানতে আমাদের সাথে থাকুন",

  "খেলাধুলার সর্বশেষ খবর এখন Daily Sheen-এ"

];


let breakingIndex = 0;


if (breakingText) {

  setInterval(
    () => {

      breakingIndex++;


      if (
        breakingIndex >=
        breakingNews.length
      ) {

        breakingIndex = 0;

      }


      breakingText.textContent =
        breakingNews[
          breakingIndex
        ];

    },
    7000
  );

}


/* =====================================================
   20. CURRENT YEAR
===================================================== */

const copyright =
  document.querySelector(
    ".copyright"
  );


if (copyright) {

  copyright.innerHTML =

    `© ${new Date().getFullYear()}
    Daily Sheen.
    All Rights Reserved.`;

}


/* =====================================================
   21. IMAGE LAZY LOAD
===================================================== */

document
  .querySelectorAll(
    "img"
  )
  .forEach(
    (img) => {

      if (
        !img.hasAttribute(
          "loading"
        )
      ) {

        img.setAttribute(
          "loading",
          "lazy"
        );

      }

    }
  );


/* =====================================================
   22. ESCAPE HTML
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
   23. START APPLICATION
===================================================== */

readURLFilters();

loadFirebaseNews();


console.log(
  "✅ Daily Sheen V7 Final App Loaded Successfully"
);
