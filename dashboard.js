import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const publishBtn = document.getElementById("publishBtn");
const newsList = document.getElementById("newsList");

async function loadNews() {

    newsList.innerHTML = "";

    const snapshot = await getDocs(collection(db, "news"));

    snapshot.forEach((item) => {

        const news = item.data();

        newsList.innerHTML += `

        <div class="news-card">

            <img src="${news.image}" alt="">

            <div class="news-content">

                <h3>${news.title}</h3>

                <p>${news.details}</p>

                <div class="news-actions">

                    <button class="delete-btn"
                    onclick="deleteNews('${item.id}')">

                    Delete

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}

publishBtn.addEventListener("click", async () => {

    const title = document.getElementById("title").value;
    const image = document.getElementById("image").value;
    const details = document.getElementById("details").value;

    if (!title || !image || !details) {
        alert("সব তথ্য পূরণ করুন");
        return;
    }

    await addDoc(collection(db, "news"), {
        title,
        image,
        details,
        createdAt: Date.now()
    });

    document.getElementById("title").value = "";
    document.getElementById("image").value = "";
    document.getElementById("details").value = "";

    alert("News Published Successfully");

    loadNews();

});

window.deleteNews = async function(id){

    if(confirm("এই সংবাদটি মুছে ফেলতে চান?")){

        await deleteDoc(doc(db, "news", id));

        loadNews();

    }

}

loadNews();
