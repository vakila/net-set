"use strict";
var m = require('mori');

var ATTRIBUTES = m.hashMap(
    "color", m.vector("red", "green", "purple"),
    "fill", m.vector("solid", "shaded", "open"),
    "number", m.vector(1, 2, 3),
    "shape", m.vector("diamond", "pill", "rectangle")
);

function cycle(current, max) {
    // console.log("current:", current, "max:", max);
    return (current === max ? 0 : current + 1);
}

function convertNumberToBase3(n) {
    var asString = (n).toString(3);
    var padded = ('0000'+asString).substring(asString.length);
    var asVector = m.map(function(i) {return parseInt(padded.charAt(i));}, m.vector(0,1,2,3))
    // console.log(n, asString, padded, asVector);
    return asVector;
}

function getCardFromNumber(n) {
    return exports.makeCard(n, convertNumberToBase3(n));
}

function shuffle(deck) {
    return m.sortBy(function(c) { return Math.random() }, deck);
}

// Functional version with correct counting using base 3
exports.makeDeck = function() {
    var names = getAttributeNames();
    var deck = m.map(getCardFromNumber, m.range(81));
    // return shuffle(deck);
    return deck;
}

//// DEPRECATED - quasi-functional version
// exports.makeDeck1 = function() {
//     var names = getAttributeNames();
//     // console.log("names:", names);
//
//     var indices = m.vector(0,0,0,0);
//
//     var deckSize = m.reduce(function(a, k) {
//         // console.log("a:", a, "k:", k);
//         // console.log("values:", m.count(m.get(ATTRIBUTES, k)));
//         return a * m.count(m.get(ATTRIBUTES, k));
//     }, 1, names);
//     // console.log("deckSize:", deckSize);
//
//     var deck = m.vector();
//
//     for (var cardNumber = 0; cardNumber < deckSize; cardNumber++) {
//         // console.log(cardNumber, indices);
//         var newCard = exports.makeCard.apply(null, m.intoArray(indices))
//         //console.log("newCard:", newCard);
//         deck = m.conj(deck, newCard);
//         // console.log("cards:", m.count(deck));
//         var indicesIndex = cardNumber % m.count(indices);
//         // console.log("indicesIndex:", indicesIndex);
//         var valueAtCurrentIndex = m.get(indices, indicesIndex);
//         // console.log("valueAtCurrentIndex:", valueAtCurrentIndex);
//         var name = m.nth(names, indicesIndex);
//         // console.log("name:", name);
//         var cycleMax = m.count(m.get(ATTRIBUTES, name)) - 1;
//         // console.log("cycleMax:", cycleMax);
//         var newIndex = cycle(valueAtCurrentIndex, cycleMax);
//         // console.log("newIndex",newIndex);
//         indices = m.assoc(indices, indicesIndex, newIndex);
//
//     }
//
//     return deck;
//
// }

//// DEPRECATED - non-functional version
// exports.makeDeck2 = function() {
//     var names = getAttributeNames();
//     var indices = mori.range(3);
//
//     var deck = mori.vector();
//
//     for (var c = 0; c<3; c++) {
//         for (var f = 0; f<3; f++) {
//             for (var n = 0; n<3; n++) {
//                 for (var s =0; s<3; s++) {
//                     var card = makeCard(c,f,n,s);
//                     deck = mori.conj(deck, card);
//                 }
//             }
//         }
//     }
//
//     return deck;
// }

function getAttributeNames(){
    var names = m.keys(ATTRIBUTES);
    return m.sort(names);
}

exports.makeCard = function(cardID, attrIndices) {
    // attrIndices is a vector of 4 elements: colorIndex, fillIndex, numberIndex, shapeIndex
    // these are integers representing the attribute indices
    // the cardID is a unique identfier for this combination of attributes,
    // i.e. the number of this card in the deck
    // e.g. makeCard(21, m.vector(1, 1, 1, 1));

    function getAttrValue(name, index) {
        var attrVec = m.get(ATTRIBUTES, name);
        return m.nth(attrVec, index);
    }

    var attrNames = getAttributeNames();

    var values = m.map(getAttrValue, attrNames, attrIndices);

    var card = m.assoc(m.zipmap(attrNames, values), 'id', cardID);

    return card;
}


exports.isSet = function(cards) {
    if (m.count(cards) !== 3) {
        return false;
    }

    return m.reduce(
        function(first, next) { return first && next;},
        areAttrsOK(cards)
    );
}

function areAttrsOK(cards) {
    return m.map(function(a) {return isAttrOK(cards, a)}, getAttributeNames());
}
function isAttrOK(cards, attr) {
    var relevant = m.map(function(card) {return m.get(card, attr);}, cards);
    var distinct = m.count(m.distinct(relevant));
    return distinct === 1 || distinct === m.count(cards);
}
