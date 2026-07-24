// ======================================================
// Daily Sheen
// Professional Firebase News Portal
// app.js - Complete Version
// ======================================================


// ======================================================
// Firebase
// ======================================================

import {
  app
} from "./firebase-config.js";


import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================================
// Initialize Firestore
// ======================================================

const db = getFirestore(app);


// ======================================================
// Global News Data
// ======================================================

let allNews = [];


// ======================================================
// HTML Elements
// ======================================================

const darkBtn =
  document.getElementById("darkBtn");

const searchInput =
  document.getElementById("searchBox");

const topBtn =
  document.getElementById("topBtn");


// ======================================================
// Dark Mode
// ======================================================

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

    }
  );

}


// ======================================================
// Load Saved Theme
// ======================================================

if (
  localStorage.getItem(
    "theme"
  ) === "dark"
) {

  document.body.classList.add(
    "dark"
  );


  if (darkBtn) {

    darkBtn.innerHTML =
      "☀️ Light Mode";

  }

}


// ======================================================
// Live Clock
// ======================================================

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


// ======================================================
// Weather Demo
// ======================================================

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
    status: "🌧️ Rain"
  },

  {
    temp: "30°C",
    status: "🌤️ Partly Cloudy"
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


// ======================================================
// Load News From Firebase
// ======================================================

async function loadNews() {

  try {

    console.log(
      "⏳ Firebase News Loading..."
    );


    // ================================================
    // Get News Collection
    // ================================================

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


    // ================================================
    // Clear Old News
    // ================================================

    allNews = [];


    // ================================================
    // Convert Firebase Data
    // ================================================

    snapshot.forEach(
      (newsDoc) => {

        const news =
          newsDoc.data();


        allNews.push({

          id:
            newsDoc.id,

          category:
            news.category ||
            "সংবাদ",

          title:
            news.title ||
            "সংবাদের শিরোনাম",

          description:
            news.description ||
            "",

          image:
            news.image ||
            "assets/news1.jpg",

          createdAt:
            news.createdAt || null

        });

      }
    );


    console.log(
      "✅ Total News:",
      allNews.length
    );


    // ================================================
    // Render News
    // ================================================

    renderAllNews(
      allNews
    );


    // ================================================
    // Category Filter
    // ================================================

    setupCategoryFilter();


  } catch (error) {

    console.error(
      "❌ Firebase News Error:",
      error
    );


    showFirebaseError(
      error
    );

  }

}


// ======================================================
// Render All News
// ======================================================

function renderAllNews(
  newsArray
) {

  renderLatestNews(
    newsArray
  );


  renderFeaturedNews(
    newsArray
  );


  renderTrendingNews(
    newsArray
  );

}


// ======================================================
// Latest News
// ======================================================

function renderLatestNews(
  newsArray
) {

  const container =
    document.querySelector(
      ".latest-news .news-grid"
    );


  if (!container) {

    return;

  }


  // ================================================
  // Empty News
  // ================================================

  if (
    newsArray.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-news">

        📰 এখনো কোনো সংবাদ প্রকাশিত হয়নি।

      </div>

    `;

    return;

  }


  // ================================================
  // News Cards
  // ================================================

  container.innerHTML =
    newsArray
      .map(
        (news) => {

          return `

            <article
              class="news-card"
              data-category="${escapeHTML(
                news.category
              )}"
            >


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


              <div
                class="news-card-content"
              >


                <span
                  class="badge"
                >

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
                  ).substring(
                    0,
                    160
                  )}

                  ${
                    news.description.length >
                    160
                      ? "..."
                      : ""
                  }

                </p>


                <a

                  href="news-details.html?id=${encodeURIComponent(
                    news.id
                  )}"

                  class="read-more-btn"

                >

                  বিস্তারিত পড়ুন →

                </a>


              </div>


            </article>

          `;

        }
      )
      .join("");


  // ================================================
  // Animation
  // ================================================

  applyCardAnimation();

}


// ======================================================
// Featured News
// ======================================================

function renderFeaturedNews(
  newsArray
) {

  const container =
    document.querySelector(
      ".featured-grid"
    );


  if (!container) {

    return;

  }


  if (
    newsArray.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-news">

        ⭐ Featured News এখনো নেই।

      </div>

    `;

    return;

  }


  // ================================================
  // First 2 News
  // ================================================

  const featured =
    newsArray.slice(
      0,
      2
    );


  container.innerHTML =
    featured
      .map(
        (news) => {

          return `

            <article
              class="featured-card"
            >


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


              <div
                class="featured-content"
              >


                <span
                  class="badge"
                >

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
                  ).substring(
                    0,
                    180
                  )}

                  ...

                </p>


                <a

                  href="news-details.html?id=${encodeURIComponent(
                    news.id
                  )}"

                  class="read-more-btn"

                >

                  Read More →

                </a>


              </div>


            </article>

          `;

        }
      )
      .join("");


  applyCardAnimation();

}


// ======================================================
// Trending News
// ======================================================

function renderTrendingNews(
  newsArray
) {

  const container =
    document.querySelector(
      ".trending-news"
    );


  if (!container) {

    return;

  }


  if (
    newsArray.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-news">

        🔥 Trending News এখনো নেই।

      </div>

    `;

    return;

  }


  // ================================================
  // First 3 News
  // ================================================

  const trending =
    newsArray.slice(
      0,
      3
    );


  container.innerHTML =
    trending
      .map(
        (news) => {

          return `

            <article
              class="trend-card"
            >


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


                <h3>

                  ${escapeHTML(
                    news.title
                  )}

                </h3>


                <p>

                  ${escapeHTML(
                    news.description
                  ).substring(
                    0,
                    120
                  )}

                  ...

                </p>


                <a

                  href="news-details.html?id=${encodeURIComponent(
                    news.id
                  )}"

                >

                  আরও পড়ুন →

                </a>


              </div>


            </article>

          `;

        }
      )
      .join("");


  applyCardAnimation();

}


// ======================================================
// Category Filter
// ======================================================

function setupCategoryFilter() {

  const navLinks =
    document.querySelectorAll(
      "nav a"
    );


  navLinks.forEach(
    (link) => {

      const href =
        link.getAttribute(
          "href"
        );


      if (
        !href ||
        !href.includes(
          "?category="
        )
      ) {

        return;

      }


      link.addEventListener(
        "click",
        (event) => {

          event.preventDefault();


          const url =
            new URL(
              link.href,
              window.location.href
            );


          const category =
            url.searchParams.get(
              "category"
            );


          if (category) {

            filterNewsByCategory(
              category
            );

          }

        }
      );

    }
  );


  // ================================================
  // Check URL Category
  // ================================================

  const params =
    new URLSearchParams(
      window.location.search
    );


  const category =
    params.get(
      "category"
    );


  if (category) {

    filterNewsByCategory(
      category
    );

  }

}


// ======================================================
// Filter News By Category
// ======================================================

function filterNewsByCategory(
  category
) {

  const filteredNews =
    allNews.filter(
      (news) => {

        return (
          news.category
            .trim()
            .toLowerCase()
        ) ===
        category
          .trim()
          .toLowerCase();

      }
    );


  // ================================================
  // Render Filtered News
  // ================================================

  renderLatestNews(
    filteredNews
  );


  // ================================================
  // Scroll To Latest News
  // ================================================

  const latest =
    document.querySelector(
      ".latest-news"
    );


  if (latest) {

    setTimeout(
      () => {

        latest.scrollIntoView({

          behavior:
            "smooth",

          block:
            "start"

        });

      },
      100
    );

  }


  console.log(
    "Category:",
    category,

    "Results:",
    filteredNews.length
  );

}


// ======================================================
// Search News
// ======================================================

function searchNews() {

  if (!searchInput) {

    return;

  }


  const keyword =
    searchInput.value
      .trim()
      .toLowerCase();


  // ================================================
  // Empty Search
  // ================================================

  if (!keyword) {

    renderLatestNews(
      allNews
    );

    return;

  }


  // ================================================
  // Search
  // ================================================

  const results =
    allNews.filter(
      (news) => {

        const searchableText =

          `${news.title}

           ${news.description}

           ${news.category}`

          .toLowerCase();


        return searchableText.includes(
          keyword
        );

      }
    );


  renderLatestNews(
    results
  );


  // ================================================
  // Scroll
  // ================================================

  const latest =
    document.querySelector(
      ".latest-news"
    );


  if (latest) {

    latest.scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

  }

}


// ======================================================
// Make Search Available Globally
// ======================================================

window.searchNews =
  searchNews;


// ======================================================
// Search Enter Key
// ======================================================

if (searchInput) {

  searchInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();

        searchNews();

      }

    }
  );

}


// ======================================================
// Back To Top
// ======================================================

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

      window.scrollTo({

        top:
          0,

        behavior:
          "smooth"

      });

    }
  );

}


// ======================================================
// Hero Slider
// ======================================================

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

        heroIndex = 0;

      }


      heroBanner.src =
        heroImages[
          heroIndex
        ];

    },
    4000
  );

}


// ======================================================
// Newsletter
// ======================================================

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


      newsletterForm.reset();

    }
  );

}


// ======================================================
// Breaking News
// ======================================================

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


// ======================================================
// Current Year
// ======================================================

const copyright =
  document.querySelector(
    ".copyright"
  );


if (copyright) {

  copyright.textContent =

    `© ${new Date().getFullYear()} Daily Sheen. All Rights Reserved.`;

}


// ======================================================
// Smooth Anchor Scroll
// ======================================================

document
  .querySelectorAll(
    'a[href^="#"]'
  )
  .forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          const targetId =
            link.getAttribute(
              "href"
            );


          if (
            !targetId ||
            targetId === "#"
          ) {

            return;

          }


          const target =
            document.querySelector(
              targetId
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


// ======================================================
// Card Animation
// ======================================================

function applyCardAnimation() {

  const cards =
    document.querySelectorAll(

      ".news-card, " +

      ".featured-card, " +

      ".trend-card"

    );


  cards.forEach(
    (card) => {

      card.style.opacity =
        "1";

      card.style.transform =
        "translateY(0)";

    }
  );

}


// ======================================================
// Firebase Error
// ======================================================

function showFirebaseError(
  error
) {

  const containers = [

    document.querySelector(
      ".latest-news .news-grid"
    ),

    document.querySelector(
      ".featured-grid"
    ),

    document.querySelector(
      ".trending-news"
    )

  ];


  containers.forEach(
    (container) => {

      if (container) {

        container.innerHTML = `

          <div class="empty-news">

            ❌ সংবাদ লোড করা যায়নি।

            <br><br>

            Firebase Firestore সংযোগ পরীক্ষা করুন।

          </div>

        `;

      }

    }
  );


  console.error(
    "Firebase Error Details:",
    error.message
  );

}


// ======================================================
// Escape HTML
// ======================================================

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


// ======================================================
// Start Application
// ======================================================

loadNews();


console.log(
  "✅ Daily Sheen Firebase News System Loaded"
);
