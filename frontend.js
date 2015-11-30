"use strict";
// var m = require('mori');
// var sl = require('./../setLogic.js');

// Displaying cards
// "Dealing" cards/arranging the board

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
