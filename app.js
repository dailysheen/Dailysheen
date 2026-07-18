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
