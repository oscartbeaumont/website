//Define UI
var home = document.getElementById("home");
var skeletal = document.getElementById("skeletal");
var digestive = document.getElementById("digestive");
var respiratory = document.getElementById("respiratory");
var circulatory = document.getElementById("circulatory");

//Onstartup Function
startup();
function startup() {
    console.log("Page Switcher Loaded");
    home.className += "visible";
}

//Onchange Function
function change(calledby) {
    var ct = calledby.innerHTML;
    if (ct == "Home") {
        home.className += "visible";
        skeletal.className = "w3-content w3-padding-xlarge w3-margin-top page";
        digestive.className = "w3-content w3-padding-xlarge w3-margin-top page";
        respiratory.className = "w3-content w3-padding-xlarge w3-margin-top page";
        circulatory.className = "w3-content w3-padding-xlarge w3-margin-top page";
    } else if (ct == "Skeletal") {
        home.className = "w3-content w3-padding-xlarge w3-margin-top page";
        skeletal.className += "visible";
        digestive.className = "w3-content w3-padding-xlarge w3-margin-top page";
        respiratory.className = "w3-content w3-padding-xlarge w3-margin-top page";
        circulatory.className = "w3-content w3-padding-xlarge w3-margin-top page";
    } else if (ct == "Digestive") {
        home.className = "w3-content w3-padding-xlarge w3-margin-top page";
        skeletal.className = "w3-content w3-padding-xlarge w3-margin-top page";
        digestive.className += "visible";
        respiratory.className = "w3-content w3-padding-xlarge w3-margin-top page";
        circulatory.className = "w3-content w3-padding-xlarge w3-margin-top page";
    } else if (ct == "Respiratory") {
        home.className = "w3-content w3-padding-xlarge w3-margin-top page";
        skeletal.className = "w3-content w3-padding-xlarge w3-margin-top page";
        digestive.className = "w3-content w3-padding-xlarge w3-margin-top page";
        respiratory.className += "visible";
        circulatory.className = "w3-content w3-padding-xlarge w3-margin-top page";
    } else if (ct == "Circulatory") {
        home.className = "w3-content w3-padding-xlarge w3-margin-top page";
        skeletal.className = "w3-content w3-padding-xlarge w3-margin-top page";
        digestive.className = "w3-content w3-padding-xlarge w3-margin-top page";
        respiratory.className = "w3-content w3-padding-xlarge w3-margin-top page";
        circulatory.className += "visible";
    } else {
        console.log("Unknown Page");
    }
}

//End