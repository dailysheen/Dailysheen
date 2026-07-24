// ======================================================
// Daily Sheen V7
// Admin Dashboard
// Firebase Authentication + Firestore News Management
// ======================================================


// ======================================================
// Firebase App
// ======================================================

import { app } from "./firebase-config.js";


// ======================================================
// Firebase Authentication
// ======================================================

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================================================
// Firebase Firestore
// ======================================================

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================================
// Initialize Firebase
// ======================================================

const auth =
  getAuth(app);

const db =
  getFirestore(app);


// ======================================================
// HTML Elements
// ======================================================

const newsForm =
  document.getElementById("newsForm");

const newsList =
  document.getElementById("newsList");

const totalNews =
  document.getElementById("totalNews");

const totalCategories =
  document.getElementById("totalCategories");

const adminEmail =
  document.getElementById("adminEmail");

const dashboardMsg =
  document.getElementById("dashboardMsg");

const logoutBtn =
  document.getElementById("logoutBtn");

const refreshBtn =
  document.getElementById("refreshBtn");


// ======================================================
// Message Function
// ======================================================

function showMessage(
  message,
  type = "success"
) {

  if (!dashboardMsg) {

    console.log(
      message
    );

    return;

  }


  dashboardMsg.textContent =
    message;


  dashboardMsg.style.padding =
    "10px 15px";


  if (
    type === "error"
  ) {

    dashboardMsg.style.color =
      "#b71c1c";

    dashboardMsg.style.background =
      "#ffebee";

  } else {

    dashboardMsg.style.color =
      "#087f23";

    dashboardMsg.style.background =
      "#e8f5e9";

  }


  setTimeout(() => {

    if (dashboardMsg) {

      dashboardMsg.textContent =
        "";

      dashboardMsg.style.padding =
        "0";

      dashboardMsg.style.background =
        "transparent";

    }

  }, 4000);

}


// ======================================================
// Authentication State
// ======================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      console.log(
        "No Admin Logged In"
      );


      window.location.href =
        "admin-login.html";


      return;

    }


    // ================================================
    // Admin Logged In
    // ================================================

    console.log(
      "Admin Logged In:",
      user.email
    );


    // ================================================
    // Show Admin Email
    // ================================================

    if (adminEmail) {

      adminEmail.textContent =
        user.email ||
        "Admin";

    }


    // ================================================
    // Load News
    // ================================================

    await loadNews();

  }
);


// ======================================================
// Logout
// ======================================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        logoutBtn.disabled =
          true;

        logoutBtn.textContent =
          "Logging out...";


        await signOut(
          auth
        );


        window.location.href =
          "admin-login.html";


      } catch (error) {

        console.error(
          "Logout Error:",
          error
        );


        showMessage(
          "❌ Logout করা যায়নি",
          "error"
        );


        logoutBtn.disabled =
          false;

        logoutBtn.textContent =
          "🚪 Logout";

      }

    }
  );

}


// ======================================================
// ADD NEWS
// ======================================================

if (newsForm) {

  newsForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // ================================================
      // Get Elements
      // ================================================

      const categoryElement =
        document.getElementById(
          "newsCategory"
        );

      const titleElement =
        document.getElementById(
          "newsTitle"
        );

      const descriptionElement =
        document.getElementById(
          "newsDescription"
        );

      const imageElement =
        document.getElementById(
          "newsImage"
        );


      // ================================================
      // Get Values
      // ================================================

      const category =
        categoryElement
          ? categoryElement.value.trim()
          : "";


      const title =
        titleElement
          ? titleElement.value.trim()
          : "";


      const description =
        descriptionElement
          ? descriptionElement.value.trim()
          : "";


      const image =
        imageElement
          ? imageElement.value.trim()
          : "";


      // ================================================
      // Validate
      // ================================================

      if (
        !category ||
        !title ||
        !description
      ) {

        showMessage(
          "⚠️ Category, Title এবং Description পূরণ করুন",
          "error"
        );

        return;

      }


      // ================================================
      // Submit Button
      // ================================================

      const submitButton =
        document.getElementById(
          "saveNewsBtn"
        );


      if (submitButton) {

        submitButton.disabled =
          true;

        submitButton.textContent =
          "⏳ Saving...";

      }


      try {

        // ==============================================
        // Add Firestore Document
        // ==============================================

        await addDoc(
          collection(
            db,
            "news"
          ),
          {

            category:
              category,

            title:
              title,

            description:
              description,

            image:
              image,

            createdAt:
              serverTimestamp(),

            createdBy:
              auth.currentUser
                ? auth.currentUser.email
                : "Admin"

          }
        );


        // ==============================================
        // Success
        // ==============================================

        showMessage(
          "✅ News সফলভাবে Publish হয়েছে",
          "success"
        );


        // ==============================================
        // Reset Form
        // ==============================================

        newsForm.reset();


        // ==============================================
        // Reload News
        // ==============================================

        await loadNews();


      } catch (error) {

        console.error(
          "Add News Error:",
          error
        );


        showMessage(
          "❌ News Publish করা যায়নি: " +
          error.message,
          "error"
        );


      } finally {

        if (submitButton) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            "💾 Save News";

        }

      }

    }
  );

}


// ======================================================
// LOAD NEWS
// ======================================================

async function loadNews() {

  if (!newsList) {

    return;

  }


  // ====================================================
  // Loading
  // ====================================================

  newsList.innerHTML = `
    <div class="loading">
      ⏳ News Loading...
    </div>
  `;


  try {

    // ==================================================
    // Firestore Query
    // ==================================================

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


    // ==================================================
    // Empty
    // ==================================================

    if (
      snapshot.empty
    ) {

      newsList.innerHTML = `
        <div class="empty-news">
          <p>
            📰 এখনো কোনো News Publish করা হয়নি।
          </p>
        </div>
      `;


      if (totalNews) {

        totalNews.textContent =
          "0";

      }


      if (totalCategories) {

        totalCategories.textContent =
          "0";

      }


      return;

    }


    // ==================================================
    // Category Set
    // ==================================================

    const categories =
      new Set();


    // ==================================================
    // Clear List
    // ==================================================

    newsList.innerHTML =
      "";


    // ==================================================
    // Loop News
    // ==================================================

    snapshot.forEach(
      (newsDoc) => {

        const news =
          newsDoc.data();


        const newsId =
          newsDoc.id;


        // ==============================================
        // Category
        // ==============================================

        if (
          news.category
        ) {

          categories.add(
            news.category
          );

        }


        // ==============================================
        // Image
        // ==============================================

        let imageHTML =
          "";


        if (
          news.image
        ) {

          imageHTML = `
            <img
              src="${escapeHTML(news.image)}"
              alt="${escapeHTML(news.title || "News")}"
              class="news-item-image"
              loading="lazy"
              onerror="this.style.display='none'"
            >
          `;

        }


        // ==============================================
        // Date
        // ==============================================

        let dateText =
          "Recently";


        if (
          news.createdAt &&
          typeof news.createdAt.toDate ===
            "function"
        ) {

          try {

            const date =
              news.createdAt.toDate();


            dateText =
              date.toLocaleString(
                "bn-BD"
              );

          } catch (error) {

            console.log(
              "Date Error:",
              error
            );

          }

        }


        // ==============================================
        // Create Card
        // ==============================================

        const card =
          document.createElement(
            "article"
          );


        card.className =
          "news-item";


        // ==============================================
        // Card HTML
        // ==============================================

        card.innerHTML = `

          ${imageHTML}

          <div class="news-content">

            <span class="news-category">

              ${escapeHTML(
                news.category ||
                "Uncategorized"
              )}

            </span>


            <h3>

              ${escapeHTML(
                news.title ||
                "Untitled News"
              )}

            </h3>


            <p>

              ${escapeHTML(
                news.description ||
                ""
              )}

            </p>


            <small class="news-date">

              📅 ${escapeHTML(
                dateText
              )}

            </small>


            <div class="news-actions">

              <button
                type="button"
                class="delete-news-btn"
                data-id="${escapeHTML(newsId)}"
              >

                🗑️ Delete

              </button>

            </div>

          </div>

        `;


        // ==============================================
        // Append Card
        // ==============================================

        newsList.appendChild(
          card
        );

      }
    );


    // ==================================================
    // Update Statistics
    // ==================================================

    if (totalNews) {

      totalNews.textContent =
        snapshot.size;

    }


    if (totalCategories) {

      totalCategories.textContent =
        categories.size;

    }


    // ==================================================
    // Delete Buttons
    // ==================================================

    const deleteButtons =
      newsList.querySelectorAll(
        ".delete-news-btn"
      );


    deleteButtons.forEach(
      (button) => {

        button.addEventListener(
          "click",
          async () => {

            const newsId =
              button.dataset.id;


            await deleteNews(
              newsId
            );

          }
        );

      }
    );


  } catch (error) {

    console.error(
      "Load News Error:",
      error
    );


    newsList.innerHTML = `

      <div class="error-news">

        <p>
          ❌ News Load করা যায়নি।
        </p>

        <small>
          ${escapeHTML(
            error.message ||
            "Unknown Error"
          )}
        </small>

      </div>

    `;


    showMessage(
      "❌ Firestore থেকে News Load করা যায়নি",
      "error"
    );

  }

}


// ======================================================
// DELETE NEWS
// ======================================================

async function deleteNews(
  newsId
) {

  if (!newsId) {

    showMessage(
      "❌ News ID পাওয়া যায়নি",
      "error"
    );

    return;

  }


  // ====================================================
  // Confirm
  // ====================================================

  const confirmed =
    confirm(
      "আপনি কি এই News টি Delete করতে চান?"
    );


  if (!confirmed) {

    return;

  }


  try {

    // ==================================================
    // Delete
    // ==================================================

    await deleteDoc(
      doc(
        db,
        "news",
        newsId
      )
    );


    // ==================================================
    // Success
    // ==================================================

    showMessage(
      "✅ News Delete হয়েছে",
      "success"
    );


    // ==================================================
    // Reload
    // ==================================================

    await loadNews();


  } catch (error) {

    console.error(
      "Delete Error:",
      error
    );


    showMessage(
      "❌ News Delete করা যায়নি: " +
      error.message,
      "error"
    );

  }

}


// ======================================================
// REFRESH
// ======================================================

if (refreshBtn) {

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


      showMessage(
        "🔄 News List Refresh হয়েছে",
        "success"
      );

    }
  );

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
// Console
// ======================================================

console.log(
  "✅ Daily Sheen Admin Dashboard Loaded Successfully"
);
