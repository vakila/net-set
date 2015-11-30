var m = require('mori');
var set = require('./setLogic.js');

exports.getInitialState = function() {
    var deck = set.makeDeck();
    var dealt = m.take(12, deck);
    var undealt = m.drop(12, deck);
    var gameState = m.hashMap('dealt', dealt, 'undealt', undealt);
    return gameState;
}

function deal(n, gameState) {
    //TODO
    return gameState;
}


function updateState(oldState) {
    var newState; // = doStuff(oldState);
    //TODO
    return newState;
}
