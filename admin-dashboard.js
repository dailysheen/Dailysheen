// ======================================================
// Daily Sheen V7
// Admin Dashboard
// Part 1 + Part 2 + Part 3 + Part 4
//
// Firebase Authentication
// Firestore News Management
//
// Features:
// 1. Admin Authentication Protection
// 2. Admin Logout
// 3. Add / Publish News
// 4. Edit / Update News
// 5. Cancel Edit
// 6. Delete News
// 7. Refresh News
// 8. Total News Statistics
// 9. Total Categories Statistics
// 10. Image URL Support
// 11. Created By Support
// 12. Firestore Timestamp
// 13. HTML Escape Security
// ======================================================


// ======================================================
// FIREBASE APP
// ======================================================

import { app } from "./firebase-config.js";


// ======================================================
// FIREBASE AUTHENTICATION
// ======================================================

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================================================
// FIREBASE FIRESTORE
// ======================================================

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================================
// INITIALIZE FIREBASE
// ======================================================

const auth =
  getAuth(app);

const db =
  getFirestore(app);


// ======================================================
// HTML ELEMENTS
// ======================================================

const newsForm =
  document.getElementById(
    "newsForm"
  );


const newsList =
  document.getElementById(
    "newsList"
  );


const totalNews =
  document.getElementById(
    "totalNews"
  );


const totalCategories =
  document.getElementById(
    "totalCategories"
  );


const adminEmail =
  document.getElementById(
    "adminEmail"
  );


const dashboardMsg =
  document.getElementById(
    "dashboardMsg"
  );


const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );


const refreshBtn =
  document.getElementById(
    "refreshBtn"
  );


// ======================================================
// FORM ELEMENTS
// ======================================================

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


const submitButton =
  document.getElementById(
    "saveNewsBtn"
  );


// ======================================================
// EDIT STATE
// ======================================================

// null = Add Mode
// News ID = Edit Mode

let editingNewsId = null;


// ======================================================
// MESSAGE FUNCTION
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


  dashboardMsg.style.borderRadius =
    "8px";


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


  setTimeout(
    () => {

      if (dashboardMsg) {

        dashboardMsg.textContent =
          "";

        dashboardMsg.style.padding =
          "0";

        dashboardMsg.style.background =
          "transparent";

      }

    },
    4000
  );

}


// ======================================================
// AUTHENTICATION STATE
// ======================================================

onAuthStateChanged(
  auth,
  async (user) => {

    // ================================================
    // USER NOT LOGGED IN
    // ================================================

    if (!user) {

      console.log(
        "No Admin Logged In"
      );


      window.location.href =
        "admin-login.html";


      return;

    }


    // ================================================
    // ADMIN LOGGED IN
    // ================================================

    console.log(
      "Admin Logged In:",
      user.email
    );


    // ================================================
    // SHOW ADMIN EMAIL
    // ================================================

    if (adminEmail) {

      adminEmail.textContent =
        user.email ||
        "Admin";

    }


    // ================================================
    // LOAD NEWS
    // ================================================

    await loadNews();

  }
);


// ======================================================
// LOGOUT
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
// NEWS FORM
// ADD + EDIT
// ======================================================

if (newsForm) {

  newsForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // ================================================
      // GET VALUES
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
      // VALIDATION
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
      // BUTTON LOADING
      // ================================================

      if (submitButton) {

        submitButton.disabled =
          true;


        submitButton.textContent =
          editingNewsId
            ? "⏳ Updating..."
            : "⏳ Saving...";

      }


      try {

        // ==============================================
        // EDIT / UPDATE MODE
        // ==============================================

        if (editingNewsId) {

          const newsRef =
            doc(
              db,
              "news",
              editingNewsId
            );


          await updateDoc(
            newsRef,
            {

              category:
                category,

              title:
                title,

              description:
                description,

              image:
                image,

              updatedAt:
                serverTimestamp(),

              updatedBy:
                auth.currentUser
                  ? auth.currentUser.email
                  : "Admin"

            }
          );


          // ============================================
          // UPDATE SUCCESS
          // ============================================

          showMessage(
            "✅ News সফলভাবে Update হয়েছে",
            "success"
          );


          // ============================================
          // RESET EDIT MODE
          // ============================================

          resetEditMode();


        } else {

          // ============================================
          // ADD / PUBLISH MODE
          // ============================================

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


          // ============================================
          // ADD SUCCESS
          // ============================================

          showMessage(
            "✅ News সফলভাবে Publish হয়েছে",
            "success"
          );


          // ============================================
          // RESET FORM
          // ============================================

          newsForm.reset();

        }


        // ==============================================
        // RELOAD NEWS
        // ==============================================

        await loadNews();


      } catch (error) {

        console.error(
          "Save / Update News Error:",
          error
        );


        showMessage(
          "❌ News Save করা যায়নি: " +
          error.message,
          "error"
        );


      } finally {

        // ==============================================
        // BUTTON RESET
        // ==============================================

        if (submitButton) {

          submitButton.disabled =
            false;


          submitButton.textContent =
            editingNewsId
              ? "✏️ Update News"
              : "💾 Save News";

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
  // LOADING
  // ====================================================

  newsList.innerHTML = `

    <div class="loading">

      ⏳ News Loading...

    </div>

  `;


  try {

    // ==================================================
    // FIRESTORE QUERY
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


    // ==================================================
    // GET DATA
    // ==================================================

    const snapshot =
      await getDocs(
        newsQuery
      );


    // ==================================================
    // EMPTY NEWS
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
    // CATEGORY SET
    // ==================================================

    const categories =
      new Set();


    // ==================================================
    // CLEAR LIST
    // ==================================================

    newsList.innerHTML =
      "";


    // ==================================================
    // LOOP NEWS
    // ==================================================

    snapshot.forEach(
      (newsDoc) => {

        // ==============================================
        // NEWS DATA
        // ==============================================

        const news =
          newsDoc.data();


        const newsId =
          newsDoc.id;


        // ==============================================
        // CATEGORY
        // ==============================================

        if (
          news.category
        ) {

          categories.add(
            news.category
          );

        }


        // ==============================================
        // IMAGE
        // ==============================================

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
                "News"
              )}"

              class="news-item-image"

              loading="lazy"

              onerror="
                this.style.display='none'
              "

            >

          `;

        }


        // ==============================================
        // DATE
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
        // CREATE CARD
        // ==============================================

        const card =
          document.createElement(
            "article"
          );


        card.className =
          "news-item";


        // ==============================================
        // CARD HTML
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

                class="edit-news-btn"

                data-id="${escapeHTML(
                  newsId
                )}"

              >

                ✏️ Edit

              </button>


              <button

                type="button"

                class="delete-news-btn"

                data-id="${escapeHTML(
                  newsId
                )}"

              >

                🗑️ Delete

              </button>


            </div>


          </div>

        `;


        // ==============================================
        // APPEND CARD
        // ==============================================

        newsList.appendChild(
          card
        );

      }
    );


    // ==================================================
    // UPDATE STATISTICS
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
    // EDIT BUTTONS
    // ==================================================

    const editButtons =
      newsList.querySelectorAll(
        ".edit-news-btn"
      );


    editButtons.forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const newsId =
              button.dataset.id;


            startEditNews(
              newsId,
              snapshot
            );

          }
        );

      }
    );


    // ==================================================
    // DELETE BUTTONS
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
// START EDIT NEWS
// ======================================================

function startEditNews(
  newsId,
  snapshot
) {

  if (
    !newsId ||
    !snapshot
  ) {

    return;

  }


  // ====================================================
  // FIND NEWS
  // ====================================================

  let selectedNews =
    null;


  snapshot.forEach(
    (newsDoc) => {

      if (
        newsDoc.id ===
        newsId
      ) {

        selectedNews = {

          id:
            newsDoc.id,

          ...newsDoc.data()

        };

      }

    }
  );


  // ====================================================
  // NEWS NOT FOUND
  // ====================================================

  if (!selectedNews) {

    showMessage(
      "❌ News পাওয়া যায়নি",
      "error"
    );


    return;

  }


  // ====================================================
  // SET EDITING ID
  // ====================================================

  editingNewsId =
    selectedNews.id;


  // ====================================================
  // FILL FORM
  // ====================================================

  if (categoryElement) {

    categoryElement.value =
      selectedNews.category ||
      "";

  }


  if (titleElement) {

    titleElement.value =
      selectedNews.title ||
      "";

  }


  if (descriptionElement) {

    descriptionElement.value =
      selectedNews.description ||
      "";

  }


  if (imageElement) {

    imageElement.value =
      selectedNews.image ||
      "";

  }


  // ====================================================
  // CHANGE BUTTON
  // ====================================================

  if (submitButton) {

    submitButton.textContent =
      "✏️ Update News";

  }


  // ====================================================
  // ADD CANCEL BUTTON
  // ====================================================

  createCancelEditButton();


  // ====================================================
  // SCROLL TO FORM
  // ====================================================

  if (newsForm) {

    newsForm.scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

  }


  showMessage(
    "✏️ Edit Mode চালু হয়েছে। News পরিবর্তন করে Update করুন।",
    "success"
  );

}


// ======================================================
// CREATE CANCEL EDIT BUTTON
// ======================================================

function createCancelEditButton() {

  // ====================================================
  // IF ALREADY EXISTS
  // ====================================================

  let cancelButton =
    document.getElementById(
      "cancelEditBtn"
    );


  if (
    cancelButton
  ) {

    cancelButton.style.display =
      "inline-block";


    return;

  }


  // ====================================================
  // CREATE BUTTON
  // ====================================================

  cancelButton =
    document.createElement(
      "button"
    );


  cancelButton.type =
    "button";


  cancelButton.id =
    "cancelEditBtn";


  cancelButton.textContent =
    "❌ Cancel Edit";


  cancelButton.style.marginLeft =
    "10px";


  cancelButton.addEventListener(
    "click",
    () => {

      resetEditMode();

    }
  );


  // ====================================================
  // ADD AFTER SAVE BUTTON
  // ====================================================

  if (submitButton) {

    submitButton.parentNode.appendChild(
      cancelButton
    );

  }

}


// ======================================================
// RESET EDIT MODE
// ======================================================

function resetEditMode() {

  editingNewsId =
    null;


  // ====================================================
  // RESET FORM
  // ====================================================

  if (newsForm) {

    newsForm.reset();

  }


  // ====================================================
  // RESET SUBMIT BUTTON
  // ====================================================

  if (submitButton) {

    submitButton.textContent =
      "💾 Save News";

  }


  // ====================================================
  // HIDE CANCEL BUTTON
  // ====================================================

  const cancelButton =
    document.getElementById(
      "cancelEditBtn"
    );


  if (
    cancelButton
  ) {

    cancelButton.style.display =
      "none";

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
  // CONFIRM
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
    // DELETE
    // ==================================================

    await deleteDoc(
      doc(
        db,
        "news",
        newsId
      )
    );


    // ==================================================
    // IF EDITING DELETED NEWS
    // ==================================================

    if (
      editingNewsId ===
      newsId
    ) {

      resetEditMode();

    }


    // ==================================================
    // SUCCESS
    // ==================================================

    showMessage(
      "✅ News Delete হয়েছে",
      "success"
    );


    // ==================================================
    // RELOAD
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

      try {

        refreshBtn.disabled =
          true;


        refreshBtn.textContent =
          "⏳ Loading...";


        await loadNews();


        showMessage(
          "🔄 News List Refresh হয়েছে",
          "success"
        );


      } catch (error) {

        console.error(
          "Refresh Error:",
          error
        );

      } finally {

        refreshBtn.disabled =
          false;


        refreshBtn.textContent =
          "🔄 Refresh";

      }

    }
  );

}


// ======================================================
// ESCAPE HTML
// SECURITY FUNCTION
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
// CONSOLE
// ======================================================

console.log(
  "✅ Daily Sheen V7 Admin Dashboard Loaded Successfully"
);
