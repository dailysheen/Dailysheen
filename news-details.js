// ======================================================
// Daily Sheen V7
// Professional News Details Page
// Firebase Firestore
// Related News + Share + Copy Link
// Dark Mode + Search + Back To Top
// ======================================================


// ======================================================
// Firebase App
// ======================================================

import { app } from "./firebase-config.js";


// ======================================================
// Firebase Firestore
// ======================================================

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================================
// Initialize Firestore
// ======================================================

const db =
  getFirestore(app);


// ======================================================
// HTML ELEMENTS
// ======================================================

const newsDetails =
  document.getElementById(
    "newsDetails"
  );


const relatedNews =
  document.getElementById(
    "relatedNews"
  );


const darkBtn =
  document.getElementById(
    "darkBtn"
  );


const searchBtn =
  document.getElementById(
    "searchBtn"
  );


const searchBox =
  document.getElementById(
    "searchBox"
  );


const detailsTopBtn =
  document.getElementById(
    "detailsTopBtn"
  );


// ======================================================
// GET NEWS ID
//
// Example:
// news-details.html?id=ABC123
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
// GLOBAL NEWS DATA
// ======================================================

let currentNews = null;


// ======================================================
// DEFAULT IMAGE
// ======================================================

const defaultImage =
  "assets/news1.jpg";


// ======================================================
// LOAD NEWS DETAILS
// ======================================================

async function loadNewsDetails() {


  // ====================================================
  // Check News ID
  // ====================================================

  if (!newsId) {

    showError(
      "❌ কোনো সংবাদ নির্বাচন করা হয়নি।"
    );

    return;

  }


  // ====================================================
  // Show Loading
  // ====================================================

  showLoading();


  try {


    // ==================================================
    // News Document Reference
    // ==================================================

    const newsRef =
      doc(
        db,
        "news",
        newsId
      );


    // ==================================================
    // Get News
    // ==================================================

    const newsSnapshot =
      await getDoc(
        newsRef
      );


    // ==================================================
    // Check Exists
    // ==================================================

    if (
      !newsSnapshot.exists()
    ) {

      showError(
        "❌ সংবাদটি পাওয়া যায়নি।"
      );

      return;

    }


    // ==================================================
    // News Data
    // ==================================================

    currentNews = {

      id:
        newsSnapshot.id,

      ...newsSnapshot.data()

    };


    // ==================================================
    // Display Main News
    // ==================================================

    displayNews(
      currentNews
    );


    // ==================================================
    // Load Related News
    // ==================================================

    await loadRelatedNews(
      currentNews
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


// ======================================================
// DISPLAY MAIN NEWS
// ======================================================

function displayNews(
  news
) {


  // ====================================================
  // CATEGORY
  // ====================================================

  const category =
    news.category ||
    "সাধারণ";


  // ====================================================
  // TITLE
  // ====================================================

  const title =
    news.title ||
    "সংবাদের শিরোনাম";


  // ====================================================
  // DESCRIPTION
  // ====================================================

  const description =
    news.description ||
    "সংবাদের বিস্তারিত তথ্য পাওয়া যায়নি।";


  // ====================================================
  // DATE
  // ====================================================

  const dateText =
    formatDate(
      news.createdAt
    );


  // ====================================================
  // IMAGE
  // ====================================================

  const image =
    news.image ||
    defaultImage;


  // ====================================================
  // PAGE TITLE
  // ====================================================

  document.title =
    title +
    " | Daily Sheen";


  // ====================================================
  // MAIN ARTICLE
  // ====================================================

  newsDetails.innerHTML = `

    <!-- ==========================================
         CATEGORY
    =========================================== -->

    <span class="news-details-category">

      🏷️
      ${escapeHTML(
        category
      )}

    </span>


    <!-- ==========================================
         TITLE
    =========================================== -->

    <h1 class="news-details-title">

      ${escapeHTML(
        title
      )}

    </h1>


    <!-- ==========================================
         META
    =========================================== -->

    <div class="news-details-meta">

      <span>

        📅

        প্রকাশিত:

        ${escapeHTML(
          dateText
        )}

      </span>


      <span>

        📰

        Daily Sheen

      </span>

    </div>


    <!-- ==========================================
         FEATURED IMAGE
    =========================================== -->

    <div class="news-details-image-wrapper">

      <img

        src="${escapeHTML(
          image
        )}"

        alt="${escapeHTML(
          title
        )}"

        class="news-details-image"

        loading="eager"

        onerror="
          this.onerror=null;
          this.src='${defaultImage}';
        "

      >

    </div>


    <!-- ==========================================
         ARTICLE CONTENT
    =========================================== -->

    <div class="news-details-description">

      ${formatDescription(
        description
      )}

    </div>


    <!-- ==========================================
         SHARE
    =========================================== -->

    <div class="news-share-area">

      <div class="news-share-title">

        📤 সংবাদটি শেয়ার করুন

      </div>


      <button

        type="button"

        class="share-btn share-facebook"

        id="facebookShareBtn"

      >

        Facebook

      </button>


      <button

        type="button"

        class="share-btn share-copy"

        id="copyLinkBtn"

      >

        🔗 Copy Link

      </button>

    </div>


    <!-- ==========================================
         BACK BUTTON
    =========================================== -->

    <a

      href="index.html"

      class="back-home-btn"

    >

      ← সকল সংবাদে ফিরে যান

    </a>

  `;


  // ====================================================
  // SHARE BUTTON EVENTS
  // ====================================================

  setupShareButtons();

}


// ======================================================
// FORMAT DESCRIPTION
// ======================================================

function formatDescription(
  description
) {


  if (
    !description
  ) {

    return `
      <p>
        সংবাদের বিস্তারিত তথ্য পাওয়া যায়নি।
      </p>
    `;

  }


  // ====================================================
  // Escape HTML
  // ====================================================

  const safeText =
    escapeHTML(
      description
    );


  // ====================================================
  // Preserve Line Break
  // ====================================================

  return safeText
    .split(
      "\n"
    )
    .map(
      (paragraph) => {

        if (
          !paragraph.trim()
        ) {

          return "";

        }


        return `
          <p>
            ${paragraph}
          </p>
        `;

      }
    )
    .join(
      ""
    );

}


// ======================================================
// LOAD RELATED NEWS
// ======================================================

async function loadRelatedNews(
  current
) {


  if (
    !relatedNews
  ) {

    return;

  }


  relatedNews.innerHTML = `

    <div class="news-loading">

      ⏳ আরও সংবাদ লোড হচ্ছে...

    </div>

  `;


  try {


    // ==================================================
    // First Try:
    // Same Category News
    // ==================================================

    let relatedQuery =
      query(

        collection(
          db,
          "news"
        ),

        orderBy(
          "createdAt",
          "desc"
        ),

        limit(
          10
        )

      );


    const snapshot =
      await getDocs(
        relatedQuery
      );


    let relatedList = [];


    snapshot.forEach(
      (newsDoc) => {


        // ==============================================
        // Exclude Current News
        // ==============================================

        if (
          newsDoc.id ===
          current.id
        ) {

          return;

        }


        const news =
          newsDoc.data();


        // ==============================================
        // Same Category
        // ==============================================

        if (
          current.category &&
          news.category ===
            current.category
        ) {

          relatedList.push({

            id:
              newsDoc.id,

            ...news

          });

        }

      }
    );


    // ==================================================
    // If Same Category Less Than 4
    // Add Other News
    // ==================================================

    if (
      relatedList.length <
      4
    ) {


      snapshot.forEach(
        (newsDoc) => {


          if (
            newsDoc.id ===
            current.id
          ) {

            return;

          }


          const alreadyAdded =
            relatedList.some(
              (item) =>
                item.id ===
                newsDoc.id
            );


          if (
            alreadyAdded
          ) {

            return;

          }


          relatedList.push({

            id:
              newsDoc.id,

            ...newsDoc.data()

          });

        }
      );

    }


    // ==================================================
    // Maximum 5 Related News
    // ==================================================

    relatedList =
      relatedList.slice(
        0,
        5
      );


    // ==================================================
    // Render Related News
    // ==================================================

    renderRelatedNews(
      relatedList
    );


  } catch (error) {


    console.error(
      "Related News Error:",
      error
    );


    relatedNews.innerHTML = `

      <div class="empty-related">

        📰 এই মুহূর্তে আরও সংবাদ পাওয়া যাচ্ছে না।

      </div>

    `;

  }

}


// ======================================================
// RENDER RELATED NEWS
// ======================================================

function renderRelatedNews(
  newsList
) {


  if (
    !relatedNews
  ) {

    return;

  }


  if (
    !newsList ||
    newsList.length ===
      0
  ) {

    relatedNews.innerHTML = `

      <div class="empty-related">

        📰 এই বিভাগে অন্য কোনো সংবাদ নেই।

      </div>

    `;

    return;

  }


  relatedNews.innerHTML =
    "";


  newsList.forEach(
    (news) => {


      const image =
        news.image ||
        defaultImage;


      const title =
        news.title ||
        "সংবাদের শিরোনাম";


      const date =
        formatDate(
          news.createdAt
        );


      const item =
        document.createElement(
          "article"
        );


      item.className =
        "related-news-item";


      item.innerHTML = `

        <a

          href="news-details.html?id=${encodeURIComponent(
            news.id
          )}"

        >

          <img

            src="${escapeHTML(
              image
            )}"

            alt="${escapeHTML(
              title
            )}"

            class="related-news-image"

            loading="lazy"

            onerror="
              this.onerror=null;
              this.src='${defaultImage}';
            "

          >

        </a>


        <div class="related-news-content">

          <a

            href="news-details.html?id=${encodeURIComponent(
              news.id
            )}"

          >

            <h4>

              ${escapeHTML(
                title
              )}

            </h4>

          </a>


          <div class="related-news-date">

            📅
            ${escapeHTML(
              date
            )}

          </div>

        </div>

      `;


      relatedNews.appendChild(
        item
      );

    }
  );

}


// ======================================================
// SHARE BUTTONS
// ======================================================

function setupShareButtons() {


  const facebookShareBtn =
    document.getElementById(
      "facebookShareBtn"
    );


  const copyLinkBtn =
    document.getElementById(
      "copyLinkBtn"
    );


  // ====================================================
  // FACEBOOK SHARE
  // ====================================================

  if (
    facebookShareBtn
  ) {

    facebookShareBtn.addEventListener(
      "click",
      () => {


        const shareURL =
          encodeURIComponent(
            window.location.href
          );


        const facebookURL =
          "https://www.facebook.com/sharer/sharer.php?u=" +
          shareURL;


        window.open(

          facebookURL,

          "_blank",

          "width=600,height=500"

        );

      }
    );

  }


  // ====================================================
  // COPY LINK
  // ====================================================

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


          copyLinkBtn.textContent =
            "✅ Link Copied";


          setTimeout(
            () => {

              copyLinkBtn.textContent =
                "🔗 Copy Link";

            },
            2000
          );


        } catch (
          error
        ) {


          console.error(
            "Copy Link Error:",
            error
          );


          // ==================================================
          // Fallback
          // ==================================================

          const tempInput =
            document.createElement(
              "input"
            );


          tempInput.value =
            window.location.href;


          document.body.appendChild(
            tempInput
          );


          tempInput.select();


          document.execCommand(
            "copy"
          );


          tempInput.remove();


          copyLinkBtn.textContent =
            "✅ Link Copied";


          setTimeout(
            () => {

              copyLinkBtn.textContent =
                "🔗 Copy Link";

            },
            2000
          );

        }

      }
    );

  }

}


// ======================================================
// ERROR MESSAGE
// ======================================================

function showError(
  message
) {


  if (
    !newsDetails
  ) {

    return;

  }


  newsDetails.innerHTML = `

    <div class="news-error">

      <h2>

        ${escapeHTML(
          message
        )}

      </h2>


      <p>

        দুঃখিত, আপনার অনুরোধ করা সংবাদটি প্রদর্শন করা সম্ভব হয়নি।

      </p>


      <a

        href="index.html"

        class="back-home-btn"

      >

        ← হোম পেজে ফিরে যান

      </a>

    </div>

  `;


  if (
    relatedNews
  ) {

    relatedNews.innerHTML = "";

  }

}


// ======================================================
// LOADING
// ======================================================

function showLoading() {


  if (
    newsDetails
  ) {

    newsDetails.innerHTML = `

      <div class="news-loading">

        ⏳ সংবাদ লোড হচ্ছে...

      </div>

    `;

  }


  if (
    relatedNews
  ) {

    relatedNews.innerHTML = `

      <div class="news-loading">

        ⏳ লোড হচ্ছে...

      </div>

    `;

  }

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(
  timestamp
) {


  if (
    !timestamp
  ) {

    return "সাম্প্রতিক প্রকাশিত";

  }


  try {


    // ==================================================
    // Firebase Timestamp
    // ==================================================

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


    // ==================================================
    // JavaScript Date
    // ==================================================

    if (
      timestamp instanceof Date
    ) {

      return timestamp
        .toLocaleString(
          "bn-BD"
        );

    }


    // ==================================================
    // String / Number
    // ==================================================

    const date =
      new Date(
        timestamp
      );


    if (
      !isNaN(
        date.getTime()
      )
    ) {

      return date
        .toLocaleString(
          "bn-BD"
        );

    }


  } catch (
    error
  ) {


    console.log(
      "Date Format Error:",
      error
    );

  }


  return "সাম্প্রতিক প্রকাশিত";

}


// ======================================================
// ESCAPE HTML
// Security Function
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
// DARK MODE
// ======================================================

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


// ======================================================
// DARK MODE CLICK
// ======================================================

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


// ======================================================
// RESTORE DARK MODE
// ======================================================

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


// ======================================================
// SEARCH
// ======================================================

if (
  searchBtn
) {


  searchBtn.addEventListener(
    "click",
    () => {


      const keyword =
        searchBox
          ? searchBox.value.trim()
          : "";


      if (
        !keyword
      ) {

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


// ======================================================
// SEARCH ENTER
// ======================================================

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


        if (
          searchBtn
        ) {

          searchBtn.click();

        }

      }

    }
  );

}


// ======================================================
// BACK TO TOP
// ======================================================

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


// ======================================================
// BACK TO TOP CLICK
// ======================================================

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


// ======================================================
// START APPLICATION
// ======================================================

console.log(
  "✅ Daily Sheen V7 Professional News Details Started"
);


loadNewsDetails();
