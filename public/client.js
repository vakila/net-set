"use strict";

var socket = io();

var username;
$(window).load(function() {
    username = prompt("Please enter your name");
    socket.emit('log on', username);
});

$(window).on('beforeunload', function() {
  socket.emit('log off', username);
});

// socket.on('load game state', function(gameState) {
//   loadPlayers(mori.get(gameState, 'players'));
//   // loadCards()
// });
//
// function loadPlayers(playersMap) {
//   mori.each()
// }

function getPlayerDiv(playerName, playerScore, playerColor) {
  var playerTemplate = $('#playerTemplate').text();
  return $(tmpl(playerTemplate,  {name: playerName, score: playerScore, color: playerColor}));
}

function addPlayer(filledTemplate) {
  $( "#players" ).append( filledTemplate );
}

//TODO function removePlayer(name) {}

function userActivity(name, joinedOrLeft) {
  console.log(name + " " + joinedOrLeft + " the game");
}
socket.on('log on', function(name) {
  userActivity(name, "joined");
  addPlayer(getPlayerDiv(name, 0, "pcol-6"));
});
socket.on('log off', function(name) {
  userActivity(name, "left");
});

function getCardID(targetNode) {
  if (targetNode.className === 'card-content') {
    return targetNode.id;
  }
  else {
    return getCardID(targetNode.parentNode);
  }
}
$('.card').click(function(event) {
  var cardID = getCardID(event.target);
  socket.emit('card click', {'user':username, 'card':cardID});
});

socket.on('card click', function(click) {
  console.log(click.user, "clicked card", click.card);
});


// TODO update DOM on events using underscore templates, e.g.:
// var titleNode = $(tmpl("<h1><%= title %></h1>", {title:"My site"}));

function updateCardContent(oldID, newID, newCard) {
    $('#'+oldID).replaceWith(getCardContent(newID, newCard));
}

function getCardContent(newID, newCard) {
    var template = $('#cardContentTemplate').text();
    return $(tmpl(template,  {cardID: newID, card: newCard, svgShapes: getSVGs(card)}));

}

function getSVGs(card) {
    var shapes = {pill: '<ellipse cx="35" cy="20" rx="33" ry="18"/>',
                  diamond: '<polygon points="3,20 35,3 67,20 35,37"/>',
                  rectangle: "<rect/>"}
    var svgTemplate = $('#svgTemplate').text();
    var svgs = "";
    for (var i=0; i<card.number; i++) {
        svgs += tmpl(svgTemplate, {card: card, shapes: shapes});
    }
    return svgs;
}
