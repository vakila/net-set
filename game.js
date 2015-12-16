var m = require('mori');
var set = require('./setLogic.js');

// map{'deck': <card sequence ordered by ID>,
//     'toDeal': #queue <of card IDs as ints in random order>,
//     'board': map{ <slot id>: <card id> },
//     'players': map{<name>: map{'color': <int>,
//                                'score': <int>,
//                                'claimed': <card sequence>}
//                   }
// }

exports.getInitialState = function() {
    var deck = set.makeDeck();
    var toDeal = shuffleIDs(deck);
    var board = m.hashMap('A', null,
                          'B', null,
                          'C', null,
                          'D', null,
                          'E', null,
                          'F', null,
                          'G', null,
                          'H', null,
                          'I', null,
                          'J', null,
                          'K', null,
                          'L', null,
                          'M', null,
                          'N', null,
                          'O', null,
                          'P', null,
                          'Q', null,
                          'R', null);
    var players = m.hashMap();
    var gameState = m.hashMap('deck', deck,
                              'board', board,
                              'toDeal', toDeal,
                              'players', players);
    return gameState;
}

function shuffleIDs(deck) {
    var idSeq = m.sortBy(function(c) { return Math.random() }, m.range(m.count(deck)));
    var idQueue = m.into(m.queue(), idSeq);
    // console.log("idQueue:", idQueue);
    return idQueue;
}

function deal(oldState, slotID) {
    var oldBoard = m.get(oldState, 'board');
    var oldToDeal = m.get(oldState, 'toDeal');

    var newBoard = m.assoc(oldBoard, slotID, m.peek(oldToDeal));
    var newToDeal = m.pop(oldToDeal);

    return m.pipeline(oldState,
        m.curry(m.assoc, 'board', newBoard),
        m.curry(m.assoc, 'toDeal', newToDeal)
    );
}



function discard(oldState, card) {
    var cardID = m.get(card, 'id');
    console.log("discarding card", cardID);

    var slotCardPair = m.filter(function(slotCard) {
        return m.nth(slotCard, 1) === cardID;
    }, m.get(oldState, 'board'));
    var slotID = m.nth(slotCardPair, 0);
    console.log("card was in slot", slotID);


    return m.assocIn(oldState, ['board', slotID], null);
}

function discardSet(oldState, setCards) {
    return m.reduce(function(state, card) {
        console.log("REDUCING:")
        console.log("card", card);
        console.log("board", m.get(state,board));
        return discard(state, card);
    }, oldState, setCards);
}


exports.startBoard = function(oldState) {
    return m.pipeline(
        oldState,
        m.curry(deal, 'A'),
        m.curry(deal, 'B'),
        m.curry(deal, 'C'),
        m.curry(deal, 'D'),
        m.curry(deal, 'E'),
        m.curry(deal, 'F'),
        m.curry(deal, 'G'),
        m.curry(deal, 'H'),
        m.curry(deal, 'I'),
        m.curry(deal, 'J'),
        m.curry(deal, 'K'),
        m.curry(deal, 'L')
    );
}

// function removeDealt(n, oldState) {
//     var oldToDeal = m.get(oldState, 'toDeal');
//     var newState = m.assoc(oldState, 'toDeal', m.drop(n, oldToDeal));
//     return newState;
// }

exports.addPlayer = function(name, color, oldState) {
    return m.assocIn(oldState, ['players', name], m.hashMap('color', color, 'score', 0, 'claimed', m.set()));
}

exports.removePlayer = function(name, oldState) {
    var newPlayers = m.dissoc(m.get(oldState, 'players'), name)
    return m.assoc(oldState, 'players', newPlayers);
}

exports.claimCard = function(player, cardID, oldState) {
    var card = m.nth(m.get(oldState, 'deck'), Number(cardID));
    var oldClaimed = m.getIn(oldState, ['players', player, 'claimed']);
    var newClaimed = m.conj(oldClaimed, card);
    return m.assocIn(oldState, ['players', player, 'claimed'], newClaimed);
}

exports.checkForCandidate = function(player, state) {
    var claimed = m.getIn(state, ['players', player, 'claimed']);
    return m.count(claimed) === 3;
}

exports.checkForSet = function(player, state) {
    var claimed = m.getIn(state, ['players', player, 'claimed']);
    console.log("claimed:", claimed);
    console.log("playerHasSet:", set.isSet(claimed));
    return set.isSet(claimed);
}

// //TODO
// exports.processClick = function(click, hasSetCallback, noSetCallback) {}

exports.updateScore = function(player, scoreChange, oldState) {
    return m.updateIn(oldState, ['players', player, 'score'], function(oldScore){
        return oldScore + scoreChange;
    });
}
