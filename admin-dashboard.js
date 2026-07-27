// ======================================================
// Daily Sheen V7
// Admin Dashboard
// Firebase Authentication + Firestore
// Add + Edit + Update + Delete News
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
// FIRESTORE
// ======================================================

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================================
// INITIALIZE FIREBASE
// ======================================================

const auth = getAuth(app);

const db = getFirestore(app);


// ======================================================
// HTML ELEMENTS
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


const saveNewsBtn =
  document.getElementById("saveNewsBtn");


const cancelEditBtn =
  document.getElementById("cancelEditBtn");


const formTitle =
  document.getElementById("formTitle");


// ======================================================
// FORM ELEMENTS
// ======================================================

const categoryElement =
  document.getElementById("newsCategory");


const titleElement =
  document.getElementById("newsTitle");


const descriptionElement =
  document.getElementById("newsDescription");


const imageElement =
  document.getElementById("newsImage");


// ======================================================
// GLOBAL VARIABLES
// ======================================================


// Edit Mode
let editNewsId = null;


// Prevent multiple auth loads
let currentUser = null;


// ======================================================
// MESSAGE FUNCTION
// ======================================================

function showMessage(
  message,
  type = "success"
) {

  if (!dashboardMsg) {

    console.log(message);

    return;

  }


  dashboardMsg.textContent =
    message;


  dashboardMsg.style.padding =
    "10px 15px";


  dashboardMsg.style.borderRadius =
    "8px";


  dashboardMsg.style.margin =
    "15px 0";


  if (
    type === "error"
  ) {

    dashboardMsg.style.color =
      "#b71c1c";

    dashboardMsg.style.background =
      "#ffebee";

  }

  else {

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

    // ==============================================
    // NOT LOGGED IN
    // ==============================================

    if (!user) {

      console.log(
        "No Admin Logged In"
      );


      window.location.href =
        "admin-login.html";


      return;

    }


    // ==============================================
    // ADMIN LOGGED IN
    // ==============================================

    currentUser =
      user;


    console.log(
      "Admin Logged In:",
      user.email
    );


    // ==============================================
    // SHOW ADMIN EMAIL
    // ==============================================

    if (adminEmail) {

      adminEmail.textContent =
        user.email ||
        "Admin";

    }


    // ==============================================
    // LOAD NEWS
    // ==============================================

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
          "⏳ Logging out...";


        await signOut(
          auth
        );


        window.location.href =
          "admin-login.html";


      }

      catch (error) {

        console.error(
          "Logout Error:",
          error
        );


        showMessage(
          "❌ Logout করা যায়নি।",
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
// ADD / UPDATE NEWS
// ======================================================

if (newsForm) {

  newsForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // ==============================================
      // GET VALUES
      // ==============================================

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


      // ==============================================
      // VALIDATION
      // ==============================================

      if (
        !category ||
        !title ||
        !description
      ) {

        showMessage(
          "⚠️ Category, Title এবং Description পূরণ করুন।",
          "error"
        );

        return;

      }


      // ==============================================
      // CHECK LOGIN
      // ==============================================

      if (!currentUser) {

        showMessage(
          "❌ Admin Login পাওয়া যায়নি। আবার Login করুন।",
          "error"
        );

        return;

      }


      // ==============================================
      // DISABLE BUTTON
      // ==============================================

      if (saveNewsBtn) {

        saveNewsBtn.disabled =
          true;

      }


      // =================================================
      // EDIT MODE
      // =================================================

      if (editNewsId) {

        await updateNews(
          editNewsId,
          category,
          title,
          description,
          image
        );

      }


      // =================================================
      // ADD MODE
      // =================================================

      else {

        await addNews(
          category,
          title,
          description,
          image
        );

      }

    }
  );

}


// ======================================================
// ADD NEWS
// ======================================================

async function addNews(
  category,
  title,
  description,
  image
) {

  try {

    // ==============================================
    // BUTTON LOADING
    // ==============================================

    if (saveNewsBtn) {

      saveNewsBtn.textContent =
        "⏳ Publishing...";

    }


    // ==============================================
    // FIRESTORE ADD
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

        updatedAt:
          serverTimestamp(),

        createdBy:
          currentUser.email ||
          "Admin"

      }
    );


    // ==============================================
    // SUCCESS
    // ==============================================

    showMessage(
      "✅ News সফলভাবে Publish হয়েছে।",
      "success"
    );


    // ==============================================
    // RESET FORM
    // ==============================================

    resetNewsForm();


    // ==============================================
    // RELOAD
    // ==============================================

    await loadNews();


  }

  catch (error) {

    console.error(
      "Add News Error:",
      error
    );


    showMessage(
      "❌ News Publish করা যায়নি: " +
      error.message,
      "error"
    );

  }

  finally {

    if (saveNewsBtn) {

      saveNewsBtn.disabled =
        false;

      saveNewsBtn.textContent =
        "💾 Save News";

    }

  }

}


// ======================================================
// UPDATE NEWS
// ======================================================

async function updateNews(
  newsId,
  category,
  title,
  description,
  image
) {

  try {

    // ==============================================
    // BUTTON LOADING
    // ==============================================

    if (saveNewsBtn) {

      saveNewsBtn.textContent =
        "⏳ Updating...";

    }


    // ==============================================
    // NEWS DOCUMENT
    // ==============================================

    const newsRef =
      doc(
        db,
        "news",
        newsId
      );


    // ==============================================
    // UPDATE FIRESTORE
    // ==============================================

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
          currentUser.email ||
          "Admin"

      }
    );


    // ==============================================
    // SUCCESS
    // ==============================================

    showMessage(
      "✅ News সফলভাবে Update হয়েছে।",
      "success"
    );


    // ==============================================
    // RESET FORM
    // ==============================================

    resetNewsForm();


    // ==============================================
    // RELOAD NEWS
    // ==============================================

    await loadNews();


  }

  catch (error) {

    console.error(
      "Update News Error:",
      error
    );


    showMessage(
      "❌ News Update করা যায়নি: " +
      error.message,
      "error"
    );

  }

  finally {

    if (saveNewsBtn) {

      saveNewsBtn.disabled =
        false;

      saveNewsBtn.textContent =
        "💾 Save News";

    }

  }

}


// ======================================================
// LOAD NEWS
// ======================================================

async function loadNews() {

  if (!newsList) {

    return;

  }


  // ==============================================
  // LOADING
  // ==============================================

  newsList.innerHTML = `

    <div class="loading">

      ⏳ News Loading...

    </div>

  `;


  try {

    // ==============================================
    // QUERY
    // ==============================================

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


    // ==============================================
    // EMPTY
    // ==============================================

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


    // ==============================================
    // CATEGORY SET
    // ==============================================

    const categories =
      new Set();


    // ==============================================
    // CLEAR
    // ==============================================

    newsList.innerHTML =
      "";


    // ==============================================
    // LOOP NEWS
    // ==============================================

    snapshot.forEach(
      (newsDoc) => {

        const news =
          newsDoc.data();


        const newsId =
          newsDoc.id;


        // ==========================================
        // CATEGORY
        // ==========================================

        if (
          news.category
        ) {

          categories.add(
            news.category
          );

        }


        // ==========================================
        // IMAGE
        // ==========================================

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


        // ==========================================
        // DATE
        // ==========================================

        let dateText =
          "সম্প্রতি প্রকাশিত";


        if (
          news.createdAt &&
          typeof news.createdAt.toDate ===
            "function"
        ) {

          try {

            dateText =
              news.createdAt
                .toDate()
                .toLocaleString(
                  "bn-BD"
                );

          }

          catch (error) {

            console.log(
              "Date Error:",
              error
            );

          }

        }


        // ==========================================
        // CREATE CARD
        // ==========================================

        const card =
          document.createElement(
            "article"
          );


        card.className =
          "news-item";


        // ==========================================
        // CARD HTML
        // ==========================================

        card.innerHTML = `

          ${imageHTML}


          <div class="news-content">


            <span class="news-category">

              ${escapeHTML(
                news.category ||
                "সাধারণ"
              )}

            </span>


            <h3>

              ${escapeHTML(
                news.title ||
                "শিরোনাম নেই"
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

                class="edit-btn"

                data-id="${escapeHTML(
                  newsId
                )}"

              >

                ✏️ Edit

              </button>


              <button

                type="button"

                class="delete-btn"

                data-id="${escapeHTML(
                  newsId
                )}"

              >

                🗑️ Delete

              </button>


            </div>


          </div>

        `;


        // ==========================================
        // APPEND
        // ==========================================

        newsList.appendChild(
          card
        );

      }
    );


    // ==============================================
    // STATISTICS
    // ==============================================

    if (totalNews) {

      totalNews.textContent =
        snapshot.size;

    }


    if (totalCategories) {

      totalCategories.textContent =
        categories.size;

    }


    // ==============================================
    // EDIT BUTTONS
    // ==============================================

    const editButtons =
      newsList.querySelectorAll(
        ".edit-btn"
      );


    editButtons.forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const newsId =
              button.dataset.id;


            startEditNews(
              newsId
            );

          }
        );

      }
    );


    // ==============================================
    // DELETE BUTTONS
    // ==============================================

    const deleteButtons =
      newsList.querySelectorAll(
        ".delete-btn"
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


  }

  catch (error) {

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
      "❌ Firestore থেকে News Load করা যায়নি।",
      "error"
    );

  }

}


// ======================================================
// START EDIT NEWS
// ======================================================

function startEditNews(
  newsId
) {

  if (!newsId) {

    showMessage(
      "❌ News ID পাওয়া যায়নি।",
      "error"
    );

    return;

  }


  // ==============================================
  // FIND NEWS
  // ==============================================

  const newsCard =
    newsList.querySelector(
      `[data-id="${CSS.escape(
        newsId
      )}"]`
    );


  if (!newsCard) {

    showMessage(
      "❌ News Card পাওয়া যায়নি।",
      "error"
    );

    return;

  }


  // ==============================================
  // FIND CARD CONTENT
  // ==============================================

  const card =
    newsCard.closest(
      ".news-item"
    );


  if (!card) {

    showMessage(
      "❌ News Card পাওয়া যায়নি।",
      "error"
    );

    return;

  }


  // ==============================================
  // GET NEWS DATA
  // ==============================================

  const category =
    card
      .querySelector(
        ".news-category"
      )
      ?.textContent
      .trim() ||
      "";


  const title =
    card
      .querySelector(
        "h3"
      )
      ?.textContent
      .trim() ||
      "";


  const description =
    card
      .querySelector(
        "p"
      )
      ?.textContent
      .trim() ||
      "";


  // ==============================================
  // IMAGE URL
  // ==============================================

  let image = "";


  const imageElement =
    card.querySelector(
      ".news-item-image"
    );


  if (
    imageElement &&
    imageElement.src
  ) {

    image =
      imageElement.src;

  }


  // ==============================================
  // SET EDIT MODE
  // ==============================================

  editNewsId =
    newsId;


  // ==============================================
  // FILL FORM
  // ==============================================

  if (categoryElement) {

    categoryElement.value =
      category;

  }


  if (titleElement) {

    titleElement.value =
      title;

  }


  if (descriptionElement) {

    descriptionElement.value =
      description;

  }


  if (imageElement) {

    imageElement.value =
      image;

  }


  // ==============================================
  // UPDATE FORM TITLE
  // ==============================================

  if (formTitle) {

    formTitle.textContent =
      "✏️ Edit News";

  }


  // ==============================================
  // UPDATE SAVE BUTTON
  // ==============================================

  if (saveNewsBtn) {

    saveNewsBtn.textContent =
      "💾 Update News";

  }


  // ==============================================
  // SHOW CANCEL BUTTON
  // ==============================================

  if (cancelEditBtn) {

    cancelEditBtn.style.display =
      "inline-block";

  }


  // ==============================================
  // SCROLL TO FORM
  // ==============================================

  if (newsForm) {

    newsForm.scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

  }

}


// ======================================================
// CANCEL EDIT
// ======================================================

if (cancelEditBtn) {

  cancelEditBtn.addEventListener(
    "click",
    () => {

      resetNewsForm();


      showMessage(
        "✖️ Edit Cancel করা হয়েছে।",
        "success"
      );

    }
  );

}


// ======================================================
// RESET FORM
// ======================================================

function resetNewsForm() {

  // ==============================================
  // RESET EDIT ID
  // ==============================================

  editNewsId =
    null;


  // ==============================================
  // RESET FORM
  // ==============================================

  if (newsForm) {

    newsForm.reset();

  }


  // ==============================================
  // FORM TITLE
  // ==============================================

  if (formTitle) {

    formTitle.textContent =
      "➕ Add New News";

  }


  // ==============================================
  // SAVE BUTTON
  // ==============================================

  if (saveNewsBtn) {

    saveNewsBtn.textContent =
      "💾 Save News";

  }


  // ==============================================
  // CANCEL BUTTON
  // ==============================================

  if (cancelEditBtn) {

    cancelEditBtn.style.display =
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
      "❌ News ID পাওয়া যায়নি।",
      "error"
    );

    return;

  }


  // ==============================================
  // CONFIRM
  // ==============================================

  const confirmed =
    confirm(
      "আপনি কি নিশ্চিতভাবে এই News টি Delete করতে চান?"
    );


  if (!confirmed) {

    return;

  }


  try {

    // ==============================================
    // DELETE DOCUMENT
    // ==============================================

    await deleteDoc(
      doc(
        db,
        "news",
        newsId
      )
    );


    // ==============================================
    // IF EDITING DELETED NEWS
    // ==============================================

    if (
      editNewsId ===
      newsId
    ) {

      resetNewsForm();

    }


    // ==============================================
    // SUCCESS
    // ==============================================

    showMessage(
      "🗑️ News সফলভাবে Delete হয়েছে।",
      "success"
    );


    // ==============================================
    // RELOAD
    // ==============================================

    await loadNews();


  }

  catch (error) {

    console.error(
      "Delete News Error:",
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
// REFRESH NEWS
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
        "🔄 News List Refresh হয়েছে।",
        "success"
      );

    }
  );

}


// ======================================================
// ESCAPE HTML
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
  "✅ Daily Sheen V7 Admin Dashboard Loaded"
);
