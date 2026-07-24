// ======================================================
// Daily Sheen
// News Details Page
// Firebase Firestore
// ======================================================


// ======================================================
// Firebase Config
// ======================================================

import {
  app
} from "./firebase-config.js";


// ======================================================
// Firestore
// ======================================================

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================================
// Initialize Firestore
// ======================================================

const db =
  getFirestore(app);


// ======================================================
// HTML Element
// ======================================================

const newsDetails =
  document.getElementById(
    "newsDetails"
  );


// ======================================================
// Get News ID From URL
// ======================================================

const urlParams =
  new URLSearchParams(
    window.location.search
  );


const newsId =
  urlParams.get(
    "id"
  );


// ======================================================
// Check News ID
// ======================================================

if (!newsId) {

  showError(
    "সংবাদের ID পাওয়া যায়নি।"
  );

} else {

  loadNewsDetails(
    newsId
  );

}


// ======================================================
// Load News Details
// ======================================================

async function loadNewsDetails(
  id
) {

  try {

    // Loading

    newsDetails.innerHTML = `

      <div class="news-loading">

        ⏳ সংবাদ লোড হচ্ছে...

      </div>

    `;


    // Get Document

    const newsRef =
      doc(
        db,
        "news",
        id
      );


    const newsSnapshot =
      await getDoc(
        newsRef
      );


    // Check Exists

    if (
      !newsSnapshot.exists()
    ) {

      showError(
        "এই সংবাদটি পাওয়া যায়নি।"
      );

      return;

    }


    // Get Data

    const news =
      newsSnapshot.data();


    // Date

    let dateText =
      "সাম্প্রতিক";


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


    // Image

    let imageHTML =
      "";


    if (
      news.image
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

          class="news-details-image"

          onerror="
            this.style.display='none'
          "

        >

      `;

    }


    // Render News

    newsDetails.innerHTML = `

      <div class="news-details-category">

        ${escapeHTML(
          news.category ||
          "সংবাদ"
        )}

      </div>


      <h1 class="news-details-title">

        ${escapeHTML(
          news.title ||
          "শিরোনাম পাওয়া যায়নি"
        )}

      </h1>


      <div class="news-details-meta">

        📅 ${dateText}

        &nbsp; | &nbsp;

        📰 Daily Sheen

      </div>


      ${imageHTML}


      <div class="news-details-description">

        ${formatText(
          news.description ||
          ""
        )}

      </div>


      <div class="news-share">

        <h3>
          📢 শেয়ার করুন
        </h3>


        <button
          id="copyNewsBtn"
          type="button"
        >

          🔗 Link Copy

        </button>

      </div>

    `;


    // Copy Link

    const copyBtn =
      document.getElementById(
        "copyNewsBtn"
      );


    if (copyBtn) {

      copyBtn.addEventListener(
        "click",
        async () => {

          try {

            await navigator.clipboard.writeText(
              window.location.href
            );


            copyBtn.textContent =
              "✅ Link Copied";


            setTimeout(
              () => {

                copyBtn.textContent =
                  "🔗 Link Copy";

              },
              2000
            );


          } catch (error) {

            alert(
              "Link Copy করা যায়নি"
            );

          }

        }
      );

    }


    // Change Page Title

    document.title =
      `${news.title || "News"} | Daily Sheen`;


  } catch (error) {

    console.error(
      "News Details Error:",
      error
    );


    showError(
      "সংবাদ লোড করা যায়নি। Firebase Firestore সংযোগ পরীক্ষা করুন।"
    );

  }

}


// ======================================================
// Error Function
// ======================================================

function showError(
  message
) {

  if (!newsDetails) {
    return;
  }


  newsDetails.innerHTML = `

    <div class="news-error">

      ❌ ${escapeHTML(
        message
      )}

      <br><br>

      <a href="index.html">

        ← Homepage-এ ফিরে যান

      </a>

    </div>

  `;

}


// ======================================================
// Format Text
// ======================================================

function formatText(
  text
) {

  return escapeHTML(
    text
  ).replace(
    /\n/g,
    "<br><br>"
  );

}


// ======================================================
// Security
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


console.log(
  "✅ Daily Sheen News Details Loaded"
);
