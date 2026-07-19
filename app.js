// Daily Sheen

console.log("Daily Sheen Loaded");

// Welcome Message
window.onload = function () {
    alert("Welcome to Daily Sheen");
};

function searchNews(){
    let text=document.getElementById("searchBox").value;

    if(text==""){
        alert("অনুগ্রহ করে কিছু লিখুন");
    }else{
        alert("আপনি খুঁজেছেন: " + text);
    }
}

const btn=document.getElementById("darkBtn");

btn.onclick=function(){

document.body.classList.toggle("dark");

}

// Dark Mode

const darkBtn = document.getElementById("darkBtn");

if(darkBtn){
    darkBtn.addEventListener("click", function(){
        document.body.classList.toggle("dark");
    });
}
