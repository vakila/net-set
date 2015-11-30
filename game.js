var m = require('mori');
var set = require('./setLogic.js');

// map{'dealt': <card sequence>,
//     'undealt': <card sequence>,
//     'players': map{<name>: map{'score': <int>,
//                                'claimed': <card sequence>}
//                   }
// }

exports.getInitialState = function() {
    var deck = set.makeDeck();
    var dealt = m.take(12, deck);
    var undealt = m.drop(12, deck);
    var players = m.hashMap();
    var gameState = m.hashMap('dealt', dealt, 'undealt', undealt, 'players', players);
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
