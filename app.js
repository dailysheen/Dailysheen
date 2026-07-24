/* =====================================================
   Daily Sheen V7
   app.js
   Firebase Firestore News + Search + Category Filter
===================================================== */


/* =====================================================
   1. FIREBASE CONFIG
===================================================== */

import { app } from "./firebase-config.js";


/* =====================================================
   2. FIREBASE FIRESTORE
===================================================== */

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =====================================================
   3. INITIALIZE FIRESTORE
===================================================== */

const db = getFirestore(app);


/* =====================================================
   4. HTML ELEMENTS
===================================================== */

const newsGrid =
  document.getElementById("newsGrid");

const newsLoading =
  document.getElementById("newsLoading");

const newsError =
  document.getElementById("newsError");

const emptyNews =
  document.getElementById("emptyNews");

const currentCategory =
  document.getElementById("currentCategory");

const searchMessage =
  document.getElementById("searchMessage");

const searchBox =
  document.getElementById("searchBox");

const searchBtn =
  document.getElementById("searchBtn");

const refreshNewsBtn =
  document.getElementById("refreshNewsBtn");

const retryBtn =
  document.getElementById("retryBtn");

const featuredGrid =
  document.getElementById("featuredGrid");

const darkBtn =
  document.getElementById("darkBtn");

const topBtn =
  document.getElementById("topBtn");

const liveClock =
  document.getElementById("liveClock");

const liveDate =
  document.getElementById("liveDate");

const newsletterForm =
  document.getElementById("newsletterForm");


/* =====================================================
   5. GLOBAL NEWS DATA
===================================================== */

let allNews = [];

let selectedCategory = "all";

let currentSearch = "";


/* =====================================================
   6. CATEGORY NAME
===================================================== */

const categoryNames = {

  all:
    "সকল বিভাগের সর্বশেষ সংবাদ",

  "বাংলাদেশ":
    "বাংলাদেশের সর্বশেষ সংবাদ",

  "আন্তর্জাতিক":
    "আন্তর্জাতিক সর্বশেষ সংবাদ",

  "রাজনীতি":
    "রাজনীতি বিষয়ক সর্বশেষ সংবাদ",

  "স্বাস্থ্য":
    "স্বাস্থ্য বিষয়ক সর্বশেষ সংবাদ",

  "রোগ ও চিকিৎসা":
    "রোগ ও চিকিৎসা বিষয়ক সংবাদ",

  "প্রযুক্তি":
    "প্রযুক্তি বিষয়ক সর্বশেষ সংবাদ",

  "খেলাধুলা":
    "খেলাধুলার সর্বশেষ সংবাদ",

  "চাকরি":
    "চাকরির সর্বশেষ সংবাদ"

};


/* =====================================================
   7. LOAD NEWS FROM FIRESTORE
===================================================== */

async function loadNews() {

  /* Loading */

  showLoading();


  try {

    console.log(
      "Loading News From Firestore..."
    );


    /* ---------------------------------------------
       Firestore Query
    --------------------------------------------- */

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


    /* ---------------------------------------------
       Get Documents
    --------------------------------------------- */

    const snapshot =
      await getDocs(
        newsQuery
      );


    /* ---------------------------------------------
       Convert Data
    --------------------------------------------- */

    allNews = [];


    snapshot.forEach(
      (docSnapshot) => {

        const data =
          docSnapshot.data();


        allNews.push({

          id:
            docSnapshot.id,

          category:
            data.category || "",

          title:
            data.title || "শিরোনাম নেই",

          description:
            data.description || "",

          image:
            data.image || "",

          createdAt:
            data.createdAt || null,

          createdBy:
            data.createdBy || ""

        });

      }
    );


    console.log(
      "Total News:",
      allNews.length
    );


    /* ---------------------------------------------
       Hide Loading
    --------------------------------------------- */

    hideLoading();


    /* ---------------------------------------------
       Check Empty
    --------------------------------------------- */

    if (
      allNews.length === 0
    ) {

      showEmpty();

      renderFeatured([]);

      return;

    }


    /* ---------------------------------------------
       Render News
    --------------------------------------------- */

    renderNews();


    /* ---------------------------------------------
       Featured News
    --------------------------------------------- */

    renderFeatured(
      allNews.slice(
        0,
        3
      )
    );


  } catch (error) {

    console.error(
      "Firestore News Load Error:",
      error
    );


    hideLoading();


    showNewsError(
      error
    );

  }

}


/* =====================================================
   8. RENDER NEWS
===================================================== */

function renderNews() {

  if (!newsGrid) {
    return;
  }


  /* ---------------------------------------------
     Filter Category
  --------------------------------------------- */

  let filteredNews =
    allNews.filter(
      (news) => {

        if (
          selectedCategory ===
          "all"
        ) {

          return true;

        }


        return (
          String(
            news.category
          ).trim() ===
          String(
            selectedCategory
          ).trim()
        );

      }
    );


  /* ---------------------------------------------
     Search Filter
  --------------------------------------------- */

  if (
    currentSearch
  ) {

    filteredNews =
      filteredNews.filter(
        (news) => {

          const searchableText = (

            String(
              news.title
            ) +

            " " +

            String(
              news.description
            ) +

            " " +

            String(
              news.category
            )

          ).toLowerCase();


          return searchableText.includes(
            currentSearch.toLowerCase()
          );

        }
      );

  }


  /* ---------------------------------------------
     Update Category Title
  --------------------------------------------- */

  if (currentCategory) {

    currentCategory.textContent =
      categoryNames[
        selectedCategory
      ] ||
      "সর্বশেষ সংবাদ";

  }


  /* ---------------------------------------------
     Search Message
  --------------------------------------------- */

  if (searchMessage) {

    if (
      currentSearch
    ) {

      searchMessage.textContent =
        `🔍 "${currentSearch}" এর জন্য ${filteredNews.length}টি সংবাদ পাওয়া গেছে।`;

    } else {

      searchMessage.textContent =
        "";

    }

  }


  /* ---------------------------------------------
     Empty Check
  --------------------------------------------- */

  if (
    filteredNews.length === 0
  ) {

    newsGrid.innerHTML =
      "";

    showEmpty();

    return;

  }


  hideEmpty();


  /* ---------------------------------------------
     Clear Old News
  --------------------------------------------- */

  newsGrid.innerHTML =
    "";


  /* ---------------------------------------------
     Render Cards
  --------------------------------------------- */

  filteredNews.forEach(
    (news) => {

      const card =
        createNewsCard(
          news
        );


      newsGrid.appendChild(
        card
      );

    }
  );

}


/* =====================================================
   9. CREATE NEWS CARD
===================================================== */

function createNewsCard(
  news
) {

  const article =
    document.createElement(
      "article"
    );


  article.className =
    "news-card";


  /* ---------------------------------------------
     Image
  --------------------------------------------- */

  const image =
    document.createElement(
      "img"
    );


  image.className =
    "news-image";


  image.alt =
    news.title;


  image.loading =
    "lazy";


  if (
    news.image
  ) {

    image.src =
      news.image;

  } else {

    image.src =
      "assets/news1.jpg";

  }


  /* ---------------------------------------------
     Image Error
  --------------------------------------------- */

  image.onerror =
    function () {

      this.src =
        "assets/news1.jpg";

    };


  /* ---------------------------------------------
     Content
  --------------------------------------------- */

  const content =
    document.createElement(
      "div"
    );


  content.className =
    "news-card-content";


  /* ---------------------------------------------
     Category
  --------------------------------------------- */

  const category =
    document.createElement(
      "span"
    );


  category.className =
    "news-category";


  category.textContent =
    news.category ||
    "সাধারণ";


  /* ---------------------------------------------
     Title
  --------------------------------------------- */

  const title =
    document.createElement(
      "h3"
    );


  title.textContent =
    news.title ||
    "সংবাদের শিরোনাম";


  /* ---------------------------------------------
     Description
  --------------------------------------------- */

  const description =
    document.createElement(
      "p"
    );


  description.textContent =
    news.description ||
    "এই সংবাদের বিস্তারিত তথ্য শীঘ্রই প্রকাশ করা হবে।";


  /* ---------------------------------------------
     Date
  --------------------------------------------- */

  const date =
    document.createElement(
      "small"
    );


  date.className =
    "news-date";


  date.textContent =
    "📅 " +
    formatDate(
      news.createdAt
    );


  /* ---------------------------------------------
     Read More
  --------------------------------------------- */

  const readMore =
    document.createElement(
      "button"
    );


  readMore.type =
    "button";


  readMore.className =
    "read-more-btn";


  readMore.textContent =
    "বিস্তারিত পড়ুন →";


  readMore.addEventListener(
    "click",
    function () {

      showFullNews(
        news
      );

    }
  );


  /* ---------------------------------------------
     Append Content
  --------------------------------------------- */

  content.appendChild(
    category
  );


  content.appendChild(
    title
  );


  content.appendChild(
    description
  );


  content.appendChild(
    date
  );


  content.appendChild(
    readMore
  );


  /* ---------------------------------------------
     Append Card
  --------------------------------------------- */

  article.appendChild(
    image
  );


  article.appendChild(
    content
  );


  return article;

}


/* =====================================================
   10. SHOW FULL NEWS
===================================================== */

function showFullNews(
  news
) {

  const modal =
    document.createElement(
      "div"
    );


  modal.className =
    "news-modal";


  modal.innerHTML = `

    <div class="news-modal-overlay"></div>

    <div class="news-modal-content">

      <button
        type="button"
        class="news-modal-close"
      >
        ✕
      </button>

      <img
        src="${safeImage(
          news.image
        )}"
        alt=""
        class="modal-news-image"
      >

      <span class="news-category">
        ${escapeHTML(
          news.category ||
          "সাধারণ"
        )}
      </span>

      <h2>
        ${escapeHTML(
          news.title
        )}
      </h2>

      <small>
        📅 ${formatDate(
          news.createdAt
        )}
      </small>

      <p>
        ${escapeHTML(
          news.description
        )}
      </p>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  /* Close */

  const closeBtn =
    modal.querySelector(
      ".news-modal-close"
    );


  const overlay =
    modal.querySelector(
      ".news-modal-overlay"
    );


  closeBtn.addEventListener(
    "click",
    () => {

      modal.remove();

    }
  );


  overlay.addEventListener(
    "click",
    () => {

      modal.remove();

    }
  );

}


/* =====================================================
   11. FEATURED NEWS
===================================================== */

function renderFeatured(
  newsItems
) {

  if (!featuredGrid) {
    return;
  }


  featuredGrid.innerHTML =
    "";


  if (
    newsItems.length === 0
  ) {

    featuredGrid.innerHTML = `

      <div class="empty-featured">

        <p>
          ⭐ Featured News এখনো প্রকাশিত হয়নি।
        </p>

      </div>

    `;

    return;

  }


  newsItems.forEach(
    (news) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "featured-card";


      card.innerHTML = `

        <img
          src="${safeImage(
            news.image
          )}"
          alt=""
          loading="lazy"
        >

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


      featuredGrid.appendChild(
        card
      );

    }
  );

}


/* =====================================================
   12. CATEGORY MENU
===================================================== */

const categoryLinks =
  document.querySelectorAll(
    "[data-category]"
  );


categoryLinks.forEach(
  (link) => {

    link.addEventListener(
      "click",
      function (event) {

        event.preventDefault();


        const category =
          this.dataset.category;


        selectedCategory =
          category ||
          "all";


        currentSearch =
          "";


        if (searchBox) {

          searchBox.value =
            "";

        }


        renderNews();


        /* Scroll to News */

        const newsSection =
          document.getElementById(
            "latestNewsSection"
          );


        if (newsSection) {

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
);


/* =====================================================
   13. SEARCH FUNCTION
===================================================== */

function performSearch() {

  if (!searchBox) {
    return;
  }


  currentSearch =
    searchBox.value.trim();


  renderNews();


  const newsSection =
    document.getElementById(
      "latestNewsSection"
    );


  if (
    newsSection &&
    currentSearch
  ) {

    newsSection.scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

  }

}


/* =====================================================
   14. SEARCH BUTTON
===================================================== */

if (searchBtn) {

  searchBtn.addEventListener(
    "click",
    performSearch
  );

}


/* =====================================================
   15. SEARCH ENTER KEY
===================================================== */

if (searchBox) {

  searchBox.addEventListener(
    "keydown",
    function (event) {

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


/* =====================================================
   16. REFRESH NEWS
===================================================== */

if (refreshNewsBtn) {

  refreshNewsBtn.addEventListener(
    "click",
    async function () {

      await loadNews();

    }
  );

}


/* =====================================================
   17. RETRY BUTTON
===================================================== */

if (retryBtn) {

  retryBtn.addEventListener(
    "click",
    async function () {

      await loadNews();

    }
  );

}


/* =====================================================
   18. LOADING
===================================================== */

function showLoading() {

  if (newsLoading) {

    newsLoading.style.display =
      "block";

  }


  if (newsError) {

    newsError.style.display =
      "none";

  }


  if (emptyNews) {

    emptyNews.style.display =
      "none";

  }


  if (newsGrid) {

    newsGrid.innerHTML =
      "";

  }

}


function hideLoading() {

  if (newsLoading) {

    newsLoading.style.display =
      "none";

  }

}


/* =====================================================
   19. EMPTY NEWS
===================================================== */

function showEmpty() {

  if (emptyNews) {

    emptyNews.style.display =
      "block";

  }

}


function hideEmpty() {

  if (emptyNews) {

    emptyNews.style.display =
      "none";

  }

}


/* =====================================================
   20. FIREBASE ERROR
===================================================== */

function showNewsError(
  error
) {

  if (newsError) {

    newsError.style.display =
      "block";

  }


  if (newsGrid) {

    newsGrid.innerHTML =
      "";

  }


  if (emptyNews) {

    emptyNews.style.display =
      "none";

  }


  console.error(
    "Firebase Error:",
    error
  );

}


/* =====================================================
   21. DATE FORMAT
===================================================== */

function formatDate(
  timestamp
) {

  if (
    !timestamp
  ) {

    return "সাম্প্রতিক";

  }


  try {

    if (
      typeof timestamp.toDate ===
      "function"
    ) {

      return timestamp
        .toDate()
        .toLocaleString(
          "bn-BD"
        );

    }


    return new Date(
      timestamp
    ).toLocaleString(
      "bn-BD"
    );


  } catch (
    error
  ) {

    return "সাম্প্রতিক";

  }

}


/* =====================================================
   22. SAFE IMAGE
===================================================== */

function safeImage(
  image
) {

  if (
    image &&
    typeof image ===
    "string"
  ) {

    return escapeAttribute(
      image
    );

  }


  return "assets/news1.jpg";

}


/* =====================================================
   23. ESCAPE HTML
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
   24. ESCAPE ATTRIBUTE
===================================================== */

function escapeAttribute(
  value
) {

  return String(
    value
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
   25. DARK MODE
===================================================== */

if (darkBtn) {

  darkBtn.addEventListener(
    "click",
    function () {

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
  );

}


/* =====================================================
   26. LOAD SAVED THEME
===================================================== */

if (
  localStorage.getItem(
    "theme"
  ) === "dark"
) {

  document.body.classList.add(
    "dark"
  );


  if (darkBtn) {

    darkBtn.textContent =
      "☀️ Light Mode";

  }

}


/* =====================================================
   27. LIVE CLOCK
===================================================== */

function updateClock() {

  const now =
    new Date();


  if (liveClock) {

    liveClock.textContent =
      now.toLocaleTimeString(
        "en-GB"
      );

  }


  if (liveDate) {

    liveDate.textContent =
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
   28. WEATHER DEMO
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
      "🌧️ Rain"
  },

  {
    temp:
      "30°C",

    status:
      "🌤️ Partly Cloudy"
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
   29. BACK TO TOP
===================================================== */

if (topBtn) {

  topBtn.style.display =
    "none";


  window.addEventListener(
    "scroll",
    function () {

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
    function () {

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
   30. NEWSLETTER
===================================================== */

if (newsletterForm) {

  newsletterForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      alert(
        "ধন্যবাদ! আপনার Newsletter Subscription গ্রহণ করা হয়েছে।"
      );


      newsletterForm.reset();

    }
  );

}


/* =====================================================
   31. INITIAL LOAD
===================================================== */

loadNews();


/* =====================================================
   32. CONSOLE
===================================================== */

console.log(
  "✅ Daily Sheen V7 App Loaded"
);

console.log(
  "🔥 Firestore News System Ready"
);
