"use strict";

// Clicking on cards
function alertClicked() {
    alert("you clicked");
}

function addCardClickListeners() {
    var cards = document.getElementsByClassName("card");
    // m.map(function(n) , cards);
    for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener("click", alertClicked);
    }
}

addCardClickListeners();
