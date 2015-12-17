"use strict";

var socket = io();

// GLOBALS
var username, userColor;

// EMIT LOG ON/OFF EVENTS
// $(window).load(function() {
//     username = prompt("Please enter your name");
//     userColor = Number(prompt("Please choose a color (number 1-6)"));
//     socket.emit('log on', username, userColor);
// });

$(window).on('beforeunload', function() {
  socket.emit('log off', username);
});

// RECEIVE LOG ON/OFF EVENTS
function userActivity(name, joinedOrLeft) {
  console.log(name + " " + joinedOrLeft + " the game");
}
socket.on('log on', function(name, color) {
  userActivity(name, "joined");
  addPlayer(fillPlayerTemplate(name, 0, color, name === username));
});
socket.on('log off', function(name) {
  userActivity(name, "left");
  removePlayer(name);
});

// RECEIVE LOAD GAME EVENT
socket.on('load game', function(state) {
  console.log("Received LOAD GAME");
  console.log(state);
  loadPlayers(mori.get(mori.toClj(state), 'players')); //works (if server sends JS)
  // loadPlayers(mori.get(state, 'players')); //doesn't work (if server sends JS)

  username = prompt("Please enter your name");
  userColor = Number(prompt("Please choose a color (number 1-6)"));
  socket.emit('log on', username, userColor);
});

$("button[name='start']").click(function() {
  socket.emit('start game');
});

socket.on('start game', function(state) {
  console.log("Received START GAME");
  // updateBoard(mori.get(mori.toClj(state), 'board'));
  $( "button[name='start']" ).addClass("hidden");
  $( "#board" ).removeClass("hidden").addClass("flex");
  $( "#dealer").removeClass("hidden").addClass("flex");
  updateBoard(state);
});

function updateBoard(gameState) {
  console.log("updateBoard");
  var boardMap = gameState.board;
  var deck = gameState.deck;
  console.log("boardMap:", boardMap);
  for (var slot in boardMap) {
    console.log("slot:", slot);
    fillCardSlot(slot, deck[boardMap[slot]]);
  }
  var cardsLeft = gameState.toDeal.length;
  $("#cards-left").text(cardsLeft);
}

// MANAGE PLAYERS
function loadPlayers(playersMap) {
  console.log("loadPlayers");
  mori.each(mori.intoArray(mori.keys(playersMap)), function(name) {
      console.log("in mori.map");
      var score = mori.getIn(playersMap, [name, 'score']);
      var color = mori.getIn(playersMap, [name, 'color']);
      console.log("Adding player:", name, score, color);
      addPlayer(fillPlayerTemplate(name, score, color));
  });
}

function fillPlayerTemplate(playerName, playerScore, playerColor, isMe) {
   var playerTemplate = $('#playerTemplate').text();
   return $(tmpl(playerTemplate,  { name: playerName, score: playerScore,
                                    color: playerColor, isMe: isMe }));
}

function addPlayer(filledTemplate) {
  $( "#players" ).append( filledTemplate );
}

function removePlayer(playerName) {
  $("#"+playerName).remove();
}

function updateScore(playerName, newScore) {
  $("#"+playerName).find(".score").text(newScore);
}



// deprecated
// function getNextPlayerColor() {
//   var playerDivs = $( "#players" ).children()
//   if (playerDivs.length > 0) {
//       var lastColor = playerDivs.last().attr("class").toString().match(/pcol-(\d)/)[1];
//       console.log("lastColor:", lastColor);
//       if (lastColor < 6) {
//           return ++lastColor;
//       }
//   }
//   return 1;
// }


// HANDLE CARD CLICKING

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
  console.log(click.player, "clicked card", click.card);
  if (click.claimed) {
      addMarker(click.card, click.player, click.color);
  } else {
      removeMarker(click.card, click.player);
  }

});

function fillMarkerTemplate(cardID, playerName, playerColor) {
  var markerTmpl = $('#markerTemplate').text();
  return $(tmpl(markerTmpl, { name: playerName, color: playerColor }));
}

function addMarker(cardID, playerName, playerColor) {
    var filledTemplate = fillMarkerTemplate(cardID, playerName, playerColor);
    console.log("adding marker:", cardID, filledTemplate);
    $('#'+cardID+" .markers").append(filledTemplate);
}

function removeMarker(cardID, playerName) {
    var marker = $('#'+cardID+" .markers [data-player="+playerName+"]");
    console.log("removing marker:", marker);
    marker.remove();
}

function clearMarkers(player, set) {
    for (var i in set) {
        var card = set[i];
        removeMarker(card.id, player);
    }
}


// MANAGE CARDS

$("button[name='deal-3']").click(function(event) {
  console.log("Upsize requested!");
  socket.emit('request upsize', {});
});

function fillCardSlot(slotID, newCard) {
    console.log("fillCardSlot:", slotID, newCard);
    var slotDiv = $('#slot-'+slotID);
    slotDiv.empty();

    if (newCard) {
        var cardTmpl = $('#cardContentTemplate').text();
        var cardContent = $(tmpl(cardTmpl,
            {card: newCard, slot: slotID, svgShapes: getSVGs(newCard)}));
        slotDiv.append(cardContent);
        slotDiv.removeClass("hidden");
    }
    else {
        slotDiv.addClass("hidden");
    }
}

function updateCardContent(oldID, newCard) {
    $('#'+oldID).replaceWith(getCardContent(newCard));
}

function getCardContent(newCard) {
    var template = $('#cardContentTemplate').text();
    return $(tmpl(template,  {card: newCard, svgShapes: getSVGs(card)}));

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

// HANDLE SET EVENTS

socket.on('set found', function(data) {
  console.log("SET FOUND:", data.user, data.set);
  clearMarkers(data.user, data.set);
  updateScore(data.user, data.gameState.players[data.user].score);
  updateBoard(data.gameState);
});

socket.on('set failed', function(data) {
  console.log("SET FAILED:", data.user, data.set);
  clearMarkers(data.user, data.set);
  updateScore(data.user, data.gameState.players[data.user].score);
});
