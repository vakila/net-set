var m = require('mori');
var set = require('./setLogic.js');

exports.getInitialState = function() {
    var deck = set.makeDeck();
    var dealt = m.take(12, deck);
    var undealt = m.drop(12, deck);
    var gameState = {'dealt': m.toJs(dealt), 'undealt': undealt};
    return gameState;
}

function deal(n, gameState) {
    //TODO
    return gameState;
}
