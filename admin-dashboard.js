// ======================================================
// Daily Sheen V7
// Admin Dashboard
// Firebase Authentication + Firestore News Management
// ======================================================

// ======================================================
// Firebase App Configuration
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
// Initialize Firebase Services
// ======================================================

const auth = getAuth(app);
const db = getFirestore(app);


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

function showMessage(message, type = "success") {

  if (!dashboardMsg) {
    console.log(message);
    return;
  }

  dashboardMsg.textContent = message;

  if (type === "error") {
    dashboardMsg.style.color = "#ff5252";
  } else {
    dashboardMsg.style.color = "#00c853";
  }

  setTimeout(() => {
    if (dashboardMsg) {
      dashboardMsg.textContent = "";
    }
  }, 4000);
}


// ======================================================
// Check Admin Login
// ======================================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    console.log("No Admin Logged In");

    // User login না করলে Admin Login Page-এ পাঠাবে
    window.location.href = "admin.html";

    return;
  }


  // ====================================================
  // Admin Logged In
  // ====================================================

  console.log(
    "Admin Logged In:",
    user.email
  );


  // Show Admin Email
  if (adminEmail) {
    adminEmail.textContent =
      user.email || "Admin";
  }


  // Load News
  await loadNews();

});


// ======================================================
// Logout
// ======================================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        showMessage(
          "✅ Logout সফল হয়েছে",
          "success"
        );

        setTimeout(() => {

          window.location.href =
            "admin.html";

        }, 1000);

      } catch (error) {

        console.error(
          "Logout Error:",
          error
        );

        showMessage(
          "❌ Logout করা যায়নি",
          "error"
        );

      }

    }
  );

}


// ======================================================
// Add News
// ======================================================

if (newsForm) {

  newsForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // ==================================================
      // Get Form Values
      // ==================================================

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


      // ==================================================
      // Get Values
      // ==================================================

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


      // ==================================================
      // Validate Form
      // ==================================================

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


      // ==================================================
      // Button Loading
      // ==================================================

      const submitButton =
        newsForm.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled =
          true;

        submitButton.textContent =
          "Saving...";

      }


      try {

        // =================================================
        // Add News to Firestore
        // =================================================

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


        // =================================================
        // Success Message
        // =================================================

        showMessage(
          "✅ News সফলভাবে Publish হয়েছে",
          "success"
        );


        // =================================================
        // Clear Form
        // =================================================

        newsForm.reset();


        // =================================================
        // Reload News
        // =================================================

        await loadNews();


      } catch (error) {

        console.error(
          "Add News Error:",
          error
        );

        showMessage(
          "❌ News Publish করা যায়নি",
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
// Load News From Firestore
// ======================================================

async function loadNews() {

  if (!newsList) {
    return;
  }


  // ====================================================
  // Loading Message
  // ====================================================

  newsList.innerHTML = `
    <p class="loading">
      ⏳ News Loading...
    </p>
  `;


  try {

    // ==================================================
    // Get News Collection
    // ==================================================

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


    // ==================================================
    // Empty News Check
    // ==================================================

    if (
      snapshot.empty
    ) {

      newsList.innerHTML = `
        <div class="empty-news">
          <p>📰 এখনো কোনো News Publish করা হয়নি।</p>
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
    // Clear News List
    // ==================================================

    newsList.innerHTML = "";


    // ==================================================
    // Loop News
    // ==================================================

    snapshot.forEach(
      (newsDoc) => {

        const news =
          newsDoc.data();


        const newsId =
          newsDoc.id;


        // Add Category
        if (
          news.category
        ) {

          categories.add(
            news.category
          );

        }


        // =================================================
        // Create News Card
        // =================================================

        const card =
          document.createElement(
            "div"
          );


        card.className =
          "news-admin-card";


        // =================================================
        // Image
        // =================================================

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
                news.title || "News"
              )}"
              class="news-admin-image"
              onerror="this.style.display='none'"
            >
          `;

        }


        // =================================================
        // Date
        // =================================================

        let dateText =
          "Recently";


        if (
          news.createdAt &&
          typeof news.createdAt.toDate ===
            "function"
        ) {

          const date =
            news.createdAt.toDate();


          dateText =
            date.toLocaleString(
              "bn-BD"
            );

        }


        // =================================================
        // Card HTML
        // =================================================

        card.innerHTML = `

          ${imageHTML}

          <div class="news-admin-content">

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

            <small>
              📅 ${dateText}
            </small>

            <div class="news-actions">

              <button
                class="delete-news-btn"
                data-id="${newsId}"
              >
                🗑️ Delete
              </button>

            </div>

          </div>

        `;


        // =================================================
        // Add Card
        // =================================================

        newsList.appendChild(
          card
        );

      }
    );


    // ==================================================
    // Update Total News
    // ==================================================

    if (totalNews) {

      totalNews.textContent =
        snapshot.size;

    }


    // ==================================================
    // Update Total Categories
    // ==================================================

    if (totalCategories) {

      totalCategories.textContent =
        categories.size;

    }


    // ==================================================
    // Delete Button Events
    // ==================================================

    const deleteButtons =
      document.querySelectorAll(
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
// Delete News
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
  // Confirm Delete
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
    // Delete Firestore Document
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
    // Reload News
    // ==================================================

    await loadNews();


  } catch (error) {

    console.error(
      "Delete Error:",
      error
    );


    showMessage(
      "❌ News Delete করা যায়নি",
      "error"
    );

  }

}


// ======================================================
// Refresh News
// ======================================================

if (refreshBtn) {

  refreshBtn.addEventListener(
    "click",
    async () => {

      await loadNews();

      showMessage(
        "🔄 News List Refresh হয়েছে",
        "success"
      );

    }
  );

}


// ======================================================
// Escape HTML
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
// Console Message
// ======================================================

console.log(
  "✅ Daily Sheen Admin Dashboard Loaded Successfully"
);
