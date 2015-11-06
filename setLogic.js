var mori = require('mori');

exports.makeCard = function(numberIndex, shapeIndex, fillIndex, colorIndex) {
    // number, shape, fill, and color are integers representing the attribute indices
    // e.g. makeCard(1, 1, 1, 1);

    var ATTRIBUTES = mori.hashMap(
        "number", mori.vector(1, 2, 3),
        "shape", mori.vector("diamond", "pill", "rectangle"),
        "fill", mori.vector("solid", "shaded", "open"),
        "color", mori.vector("red", "green", "purple")
    );

    function getAttrValue(name, index) {
        var attrVec = mori.get(ATTRIBUTES, name);
        return mori.nth(attrVec, index);
    }

    var attrNames = mori.vector("number","shape","fill","color");
    var attrIndices = mori.vector(numberIndex, shapeIndex, fillIndex, colorIndex);

    var values = mori.map(getAttrValue, attrNames, attrIndices);

    var card = mori.zipmap(attrNames, values);

    return card;
}


exports.isSet = function(cards) {
    if (cards.length !== 3) {
        return false;
    }

    return areAttrsOK(cards).reduce(
        function(first, next) { return first && next;}
    );
}

function areAttrsOK(cards) {
    // TODO seems sloppy to repeat the list of attributes in here,
    // what's the better way?
    return mori.vector(["number", "shape", "fill", "color"]).map(
        function(a) {return isAttrOK(cards, a)}
    );
}

function isAttrOK(cards, attr) {
    var relevant = mori.map(function(card) {return mori.get(card, attr);}, cards);
    var distinct = mori.count(mori.set(relevant));
    return distinct === 1 || distinct === mori.count(cards);
}
