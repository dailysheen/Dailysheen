// =====================================================
// Daily Sheen V7
// Main Website JavaScript
// Firebase Firestore News + Search + Category Filter
// =====================================================


// =====================================================
// Firebase
// =====================================================

import { app } from "./firebase-config.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// Firebase Database
// =====================================================

const db = getFirestore(app);


// =====================================================
// Global News Data
// =====================================================

let allNews = [];

let currentCategory = "all";


// =====================================================
// DOM Elements
// =====================================================

const darkBtn =
  document.getElementById("darkBtn");

const searchBox =
  document.getElementById("searchBox");

const searchBtn =
  document.getElementById("searchBtn");

const firebaseNewsGrid =
  document.getElementById("firebaseNewsGrid");

const newsStatus =
  document.getElementById("newsStatus");

const refreshNewsBtn =
  document.getElementById("refreshNewsBtn");

const activeCategoryText =
  document.getElementById(
    "activeCategoryText"
  );

const topBtn =
  document.getElementById("topBtn");

const newsletterForm =
  document.getElementById(
    "newsletterForm"
  );


// =====================================================
// DARK MODE
// =====================================================

function loadTheme() {

  const savedTheme =
    localStorage.getItem("theme");

  if (
    savedTheme === "dark"
  ) {

    document.body.classList.add(
      "dark"
    );

    if (darkBtn) {

      darkBtn.textContent =
        "☀️ Light Mode";

    }

  }

}


function toggleDarkMode() {

  if (!darkBtn) {
    return;
  }


  document.body.classList.toggle(
    "dark"
  );


  const isDark =
    document.body.classList.contains(
      "dark"
    );


  if (isDark) {

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


if (darkBtn) {

  darkBtn.addEventListener(
    "click",
    toggleDarkMode
  );

}


loadTheme();


// =====================================================
// LIVE CLOCK
// =====================================================

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


// =====================================================
// WEATHER DEMO
// =====================================================

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
    !temp ||
    !status
  ) {

    return;

  }


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


updateWeather();


setInterval(
  updateWeather,
  5000
);


// =====================================================
// LOAD NEWS FROM FIRESTORE
// =====================================================

async function loadNews() {

  if (!firebaseNewsGrid) {

    return;

  }


  firebaseNewsGrid.innerHTML = "";


  if (newsStatus) {

    newsStatus.style.display =
      "block";

    newsStatus.textContent =
      "⏳ সংবাদ লোড হচ্ছে...";

  }


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


    console.log(
      "Firebase News:",
      allNews
    );


    if (
      allNews.length === 0
    ) {

      showEmptyNews();

      return;

    }


    renderNews(
      allNews
    );


  } catch (error) {


    console.error(
      "Firebase News Error:",
      error
    );


    firebaseNewsGrid.innerHTML = `

      <div class="news-error">

        <h3>
          ❌ সংবাদ লোড করা যায়নি
        </h3>

        <p>
          Firebase Firestore সংযোগ
          পরীক্ষা করুন।
        </p>

        <small>
          ${escapeHTML(
            error.message ||
            "Unknown Error"
          )}
        </small>

      </div>

    `;


    if (newsStatus) {

      newsStatus.textContent =
        "❌ Firebase থেকে সংবাদ লোড করা যায়নি";

    }

  }

}


// =====================================================
// RENDER NEWS
// =====================================================

function renderNews(
  newsArray
) {

  if (!firebaseNewsGrid) {

    return;

  }


  firebaseNewsGrid.innerHTML =
    "";


  let filteredNews =
    newsArray;


  // ===================================================
  // CATEGORY FILTER
  // ===================================================

  if (
    currentCategory !==
    "all"
  ) {

    filteredNews =
      filteredNews.filter(
        news =>

          String(
            news.category ||
            ""
          ).trim() ===
          currentCategory

      );

  }


  // ===================================================
  // SEARCH FILTER
  // ===================================================

  const searchTerm =
    searchBox
      ? searchBox.value
          .trim()
          .toLowerCase()
      : "";


  if (searchTerm) {

    filteredNews =
      filteredNews.filter(
        news => {

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
              searchTerm
            )

            ||

            description.includes(
              searchTerm
            )

            ||

            category.includes(
              searchTerm
            )

          );

        }
      );

  }


  // ===================================================
  // NO RESULT
  // ===================================================

  if (
    filteredNews.length === 0
  ) {

    firebaseNewsGrid.innerHTML = `

      <div class="empty-news">

        <h3>
          🔍 কোনো সংবাদ পাওয়া যায়নি
        </h3>

        <p>
          অন্য Category অথবা অন্য শব্দ দিয়ে
          Search করুন।
        </p>

      </div>

    `;


    updateNewsStatus(
      0
    );


    return;

  }


  // ===================================================
  // CREATE NEWS CARDS
  // ===================================================

  filteredNews.forEach(
    news => {


      const card =
        document.createElement(
          "article"
        );


      card.className =
        "news-card";


      // =================================================
      // IMAGE
      // =================================================

      let imageHTML =
        "";


      if (
        news.image &&
        String(
          news.image
        ).trim() !== ""
      ) {

        imageHTML = `

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

        `;

      }


      // =================================================
      // DATE
      // =================================================

      let dateText =
        "সাম্প্রতিক";


      if (

        news.createdAt &&

        typeof
        news.createdAt.toDate ===
        "function"

      ) {

        const date =
          news.createdAt.toDate();


        dateText =
          date.toLocaleDateString(
            "bn-BD",
            {

              day:
                "numeric",

              month:
                "long",

              year:
                "numeric"

            }
          );

      }


      // =================================================
      // CARD HTML
      // =================================================

      card.innerHTML = `

        ${imageHTML}


        <div class="news-card-content">


          <span class="badge">

            ${escapeHTML(
              news.category ||
              "সংবাদ"
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


          <div class="news-meta">

            📅 ${dateText}

          </div>


        </div>

      `;


      firebaseNewsGrid.appendChild(
        card
      );

    }
  );


  // ===================================================
  // UPDATE STATUS
  // ===================================================

  updateNewsStatus(
    filteredNews.length
  );


}


// =====================================================
// UPDATE NEWS STATUS
// =====================================================

function updateNewsStatus(
  count
) {

  if (!newsStatus) {

    return;

  }


  if (
    currentCategory ===
    "all"
  ) {

    newsStatus.textContent =
      `📰 মোট ${count}টি সংবাদ দেখানো হচ্ছে`;

  } else {

    newsStatus.textContent =
      `🏷️ ${currentCategory} বিভাগে ${count}টি সংবাদ পাওয়া গেছে`;

  }

}


// =====================================================
// EMPTY NEWS
// =====================================================

function showEmptyNews() {

  if (!firebaseNewsGrid) {

    return;

  }


  firebaseNewsGrid.innerHTML = `

    <div class="empty-news">

      <h3>
        📰 এখনো কোনো সংবাদ প্রকাশিত হয়নি
      </h3>

      <p>
        Admin Dashboard থেকে প্রথম সংবাদটি Publish করুন।
      </p>

    </div>

  `;


  if (newsStatus) {

    newsStatus.textContent =
      "📰 এখনো কোনো সংবাদ নেই";

  }

}


// =====================================================
// CATEGORY FILTER
// =====================================================

function filterByCategory(
  category
) {

  currentCategory =
    category ||
    "all";


  // ===================================================
  // UPDATE NAV ACTIVE
  // ===================================================

  document
    .querySelectorAll(
      ".nav-link"
    )
    .forEach(
      link => {

        link.classList.remove(
          "active"
        );


        if (

          link.dataset.category ===
          currentCategory

        ) {

          link.classList.add(
            "active"
          );

        }

      }
    );


  // ===================================================
  // CATEGORY TEXT
  // ===================================================

  if (
    activeCategoryText
  ) {

    if (
      currentCategory ===
      "all"
    ) {

      activeCategoryText.textContent =
        "সকল বিভাগের সর্বশেষ সংবাদ";

    } else {

      activeCategoryText.textContent =
        `${currentCategory} বিভাগের সর্বশেষ সংবাদ`;

    }

  }


  // ===================================================
  // RENDER
  // ===================================================

  renderNews(
    allNews
  );


  // ===================================================
  // SCROLL NEWS
  // ===================================================

  const newsContainer =
    document.getElementById(
      "newsContainer"
    );


  if (
    newsContainer
  ) {

    newsContainer.scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

  }

}


// =====================================================
// NAVIGATION EVENTS
// =====================================================

document
  .querySelectorAll(
    ".nav-link"
  )
  .forEach(
    link => {

      link.addEventListener(
        "click",
        event => {


          const category =
            link.dataset.category;


          if (
            category
          ) {

            event.preventDefault();


            filterByCategory(
              category
            );

          }

        }
      );

    }
  );


// =====================================================
// CATEGORY CARD EVENTS
// =====================================================

document
  .querySelectorAll(
    ".category-card"
  )
  .forEach(
    card => {

      card.addEventListener(
        "click",
        () => {


          const category =
            card.dataset.category;


          filterByCategory(
            category
          );


        }
      );

    }
  );


// =====================================================
// SEARCH
// =====================================================

function performSearch() {

  renderNews(
    allNews
  );

}


if (searchBtn) {

  searchBtn.addEventListener(
    "click",
    performSearch
  );

}


if (searchBox) {

  searchBox.addEventListener(
    "input",
    performSearch
  );


  searchBox.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();

        performSearch();

      }

    }
  );

}


// =====================================================
// REFRESH NEWS
// =====================================================

if (
  refreshNewsBtn
) {

  refreshNewsBtn.addEventListener(
    "click",
    async () => {


      refreshNewsBtn.disabled =
        true;


      refreshNewsBtn.textContent =
        "⏳ Loading...";


      await loadNews();


      refreshNewsBtn.disabled =
        false;


      refreshNewsBtn.textContent =
        "🔄 Refresh";


    }
  );

}


// =====================================================
// HERO SLIDER
// =====================================================

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

        heroIndex = 0;

      }


      heroBanner.src =
        heroImages[
          heroIndex
        ];


    },
    5000
  );

}


// =====================================================
// BREAKING NEWS
// =====================================================

const breakingNews = [

  "বাংলাদেশের সর্বশেষ সংবাদ দেখুন Daily Sheen-এ",

  "স্বাস্থ্য ও চিকিৎসা বিষয়ক নতুন তথ্য প্রকাশিত হয়েছে",

  "প্রযুক্তির নতুন আপডেট জানতে আমাদের সাথে থাকুন",

  "খেলাধুলার সর্বশেষ খবর এখন Daily Sheen-এ",

  "আন্তর্জাতিক অঙ্গনের গুরুত্বপূর্ণ সংবাদ এখন Daily Sheen-এ"

];


let breakingIndex =
  0;


const breakingText =
  document.getElementById(
    "breakingText"
  );


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

        breakingIndex = 0;

      }


      breakingText.textContent =
        breakingNews[
          breakingIndex
        ];


    },
    5000
  );

}


// =====================================================
// BACK TO TOP
// =====================================================

if (
  topBtn
) {


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
// NEWSLETTER
// =====================================================

if (
  newsletterForm
) {

  newsletterForm.addEventListener(
    "submit",
    event => {


      event.preventDefault();


      alert(

        "ধন্যবাদ! Daily Sheen Newsletter-এর জন্য আপনার সাবস্ক্রিপশন গ্রহণ করা হয়েছে।"

      );


      newsletterForm.reset();


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


// =====================================================
// START APPLICATION
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadNews();

    console.log(
      "✅ Daily Sheen V7 loaded successfully"
    );

  }
);
