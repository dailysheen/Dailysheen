// ==========================================
// Daily Sheen V7
// Admin Dashboard - Part 4
// Firebase Firestore News Management
// ==========================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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


// ==========================================
// Firebase Configuration
// ==========================================

const firebaseConfig = {
  apiKey: "আপনার_API_KEY",
  authDomain: "daily-sheen.firebaseapp.com",
  projectId: "daily-sheen",
  storageBucket: "daily-sheen.firebasestorage.app",
  messagingSenderId: "521433909326",
  appId: "আপনার_APP_ID"
};


// ==========================================
// Initialize Firebase
// ==========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ==========================================
// HTML Elements
// ==========================================

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


// ==========================================
// Check Admin Login
// ==========================================

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href =
      "admin.html";

    return;

  }


  // Show Admin Email

  if (adminEmail) {

    adminEmail.textContent =
      user.email;

  }


  // Load News

  loadNews();

});


// ==========================================
// Logout
// ==========================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        window.location.href =
          "admin.html";

      } catch (error) {

        console.error(
          "Logout Error:",
          error
        );

      }

    }
  );

}


// ==========================================
// Add News
// ==========================================

if (newsForm) {

  newsForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const category =
        document
          .getElementById("newsCategory")
          .value
          .trim();


      const title =
        document
          .getElementById("newsTitle")
          .value
          .trim();


      const description =
        document
          .getElementById("newsDescription")
          .value
          .trim();


      const image =
        document
          .getElementById("newsImage")
          .value
          .trim();


      const saveBtn =
        document.getElementById(
          "saveNewsBtn"
        );


      // Validation

      if (
        !category ||
        !title ||
        !description
      ) {

        showMessage(
          "❌ Category, Title এবং Description পূরণ করুন।",
          "error"
        );

        return;

      }


      // Loading

      saveBtn.disabled =
        true;

      saveBtn.textContent =
        "Publishing...";


      try {

        // Save to Firestore

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

            author:
              auth.currentUser.email,

            createdAt:
              serverTimestamp(),

            published:
              true

          }
        );


        // Success

        showMessage(
          "✅ News সফলভাবে Publish হয়েছে!",
          "success"
        );


        // Reset Form

        newsForm.reset();


        // Reload News

        await loadNews();


      } catch (error) {

        console.error(
          "Publish Error:",
          error
        );


        showMessage(
          "❌ News Publish করা যায়নি। আবার চেষ্টা করুন।",
          "error"
        );

      }


      // Reset Button

      saveBtn.disabled =
        false;

      saveBtn.textContent =
        "💾 Save News";

    }
  );

}


// ==========================================
// Load News
// ==========================================

async function loadNews() {

  try {

    newsList.innerHTML =
      "<p>সংবাদ লোড হচ্ছে...</p>";


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


    totalNews.textContent =
      snapshot.size;


    const categories =
      new Set();


    if (
      snapshot.empty
    ) {

      newsList.innerHTML = `
        <p class="empty-message">
          এখনো কোনো News যোগ করা হয়নি।
        </p>
      `;

      totalCategories.textContent =
        "0";

      return;

    }


    newsList.innerHTML =
      "";


    snapshot.forEach(
      (newsDoc) => {

        const news =
          newsDoc.data();


        categories.add(
          news.category
        );


        const item =
          document.createElement(
            "div"
          );


        item.className =
          "news-item";


        item.innerHTML = `

          <div class="news-content">

            <span class="news-category">
              ${escapeHTML(
                news.category || ""
              )}
            </span>

            <h3>
              ${escapeHTML(
                news.title || ""
              )}
            </h3>

            <p>
              ${escapeHTML(
                news.description || ""
              )}
            </p>

            <small>
              Author:
              ${escapeHTML(
                news.author || ""
              )}
            </small>

          </div>


          <div class="news-actions">

            <button
              class="delete-btn"
              data-id="${newsDoc.id}"
            >
              🗑️ Delete
            </button>

          </div>

        `;


        newsList.appendChild(
          item
        );


        // Delete Button

        const deleteBtn =
          item.querySelector(
            ".delete-btn"
          );


        deleteBtn.addEventListener(
          "click",
          () => {

            deleteNews(
              newsDoc.id
            );

          }
        );

      }
    );


    totalCategories.textContent =
      categories.size;


  } catch (error) {

    console.error(
      "Load News Error:",
      error
    );


    newsList.innerHTML = `
      <p>
        ❌ News লোড করা যায়নি।
      </p>
    `;

  }

}


// ==========================================
// Delete News
// ==========================================

async function deleteNews(
  newsId
) {

  const confirmDelete =
    confirm(
      "আপনি কি এই News মুছে ফেলতে চান?"
    );


  if (!confirmDelete) {

    return;

  }


  try {

    await deleteDoc(

      doc(
        db,
        "news",
        newsId
      )

    );


    showMessage(
      "✅ News Delete হয়েছে।",
      "success"
    );


    await loadNews();


  } catch (error) {

    console.error(
      "Delete Error:",
      error
    );


    showMessage(
      "❌ News Delete করা যায়নি।",
      "error"
    );

  }

}


// ==========================================
// Refresh
// ==========================================

if (refreshBtn) {

  refreshBtn.addEventListener(
    "click",
    loadNews
  );

}


// ==========================================
// Message
// ==========================================

function showMessage(
  message,
  type
) {

  if (!dashboardMsg) {

    return;

  }


  dashboardMsg.textContent =
    message;


  dashboardMsg.style.color =
    type === "success"
      ? "#008f5a"
      : "#dc3545";

}


// ==========================================
// Security: Escape HTML
// ==========================================

function escapeHTML(
  text
) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    text;

  return div.innerHTML;

}
