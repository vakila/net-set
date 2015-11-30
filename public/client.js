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

function userActivity(name, joinedOrLeft) {
  console.log(name + " " + joinedOrLeft + " the game");
}
socket.on('log on', function(name) {
  userActivity(name, "joined");
});
socket.on('log off', function(name) {
  userActivity(name, "left");
});

function getCardID(targetNode) {
  if (targetNode.className === 'card') {
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
