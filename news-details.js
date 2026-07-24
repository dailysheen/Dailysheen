// ==========================================
// Daily Sheen V7
// News Details Page
// Firebase Firestore
// ==========================================

import { app } from "./firebase-config.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const db = getFirestore(app);


// ==========================================
// HTML Element
// ==========================================

const newsDetails =
  document.getElementById("newsDetails");


// ==========================================
// Get News ID
// URL Example:
// news-details.html?id=ABC123
// ==========================================

const urlParams =
  new URLSearchParams(
    window.location.search
  );

const newsId =
  urlParams.get("id");


// ==========================================
// Load News
// ==========================================

async function loadNewsDetails() {

  if (!newsId) {

    showError(
      "❌ কোনো সংবাদ নির্বাচন করা হয়নি।"
    );

    return;

  }


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


    if (!newsSnapshot.exists()) {

      showError(
        "❌ সংবাদটি পাওয়া যায়নি।"
      );

      return;

    }


    const news =
      newsSnapshot.data();


    displayNews(
      news
    );


  } catch (error) {

    console.error(
      "News Details Error:",
      error
    );


    showError(
      "❌ সংবাদ লোড করা যায়নি। Firebase সংযোগ পরীক্ষা করুন।"
    );

  }

}


// ==========================================
// Display News
// ==========================================

function displayNews(news) {

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
        .toLocaleString(
          "bn-BD"
        );

  }


  const imageHTML =
    news.image
      ? `
        <img
          src="${escapeHTML(news.image)}"
          alt="${escapeHTML(
            news.title || "Daily Sheen News"
          )}"
          class="news-details-image"
          onerror="this.style.display='none'"
        >
      `
      : "";


  newsDetails.innerHTML = `

    <span class="news-details-category">

      ${escapeHTML(
        news.category ||
        "সাধারণ"
      )}

    </span>


    <h1 class="news-details-title">

      ${escapeHTML(
        news.title ||
        "সংবাদের শিরোনাম"
      )}

    </h1>


    <div class="news-details-date">

      📅 প্রকাশিত:
      ${dateText}

    </div>


    ${imageHTML}


    <div class="news-details-description">

      ${escapeHTML(
        news.description ||
        "সংবাদের বিস্তারিত তথ্য পাওয়া যায়নি।"
      )}

    </div>


    <a
      href="index.html"
      class="back-home-btn"
    >

      ← সকল সংবাদে ফিরে যান

    </a>

  `;


  // Update Page Title

  if (news.title) {

    document.title =
      news.title +
      " | Daily Sheen";

  }

}


// ==========================================
// Error Message
// ==========================================

function showError(message) {

  newsDetails.innerHTML = `

    <div class="news-error">

      <h2>
        ${message}
      </h2>

      <br>

      <a
        href="index.html"
        class="back-home-btn"
      >

        ← হোম পেজে ফিরে যান

      </a>

    </div>

  `;

}


// ==========================================
// Escape HTML
// ==========================================

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)

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


// ==========================================
// Dark Mode
// ==========================================

const darkBtn =
  document.getElementById(
    "darkBtn"
  );


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


// Restore Theme

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


// ==========================================
// Search
// ==========================================

const searchBtn =
  document.getElementById(
    "searchBtn"
  );


const searchBox =
  document.getElementById(
    "searchBox"
  );


if (searchBtn) {

  searchBtn.addEventListener(
    "click",
    () => {

      const keyword =
        searchBox.value.trim();


      if (!keyword) {

        return;

      }


      window.location.href =
        "index.html?search=" +
        encodeURIComponent(
          keyword
        );

    }
  );

}


if (searchBox) {

  searchBox.addEventListener(
    "keyup",
    (event) => {

      if (
        event.key ===
        "Enter"
      ) {

        searchBtn.click();

      }

    }
  );

}


// ==========================================
// Start
// ==========================================

loadNewsDetails();


console.log(
  "✅ Daily Sheen News Details Loaded"
);
