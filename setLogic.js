var m = require('mori');

exports.makeCard = function(numberIndex, shapeIndex, fillIndex, colorIndex) {
    // number, shape, fill, and color are integers representing the attribute indices
    // e.g. makeCard(1, 1, 1, 1);

    var ATTRIBUTES = m.hashMap(
        "number", m.vector(1, 2, 3),
        "shape", m.vector("diamond", "pill", "rectangle"),
        "fill", m.vector("solid", "shaded", "open"),
        "color", m.vector("red", "green", "purple")
    );

    function getAttrValue(name, index) {
        var attrVec = m.get(ATTRIBUTES, name);
        return m.nth(attrVec, index);
    }

    var attrNames = m.vector("number","shape","fill","color");
    var attrIndices = m.vector(numberIndex, shapeIndex, fillIndex, colorIndex);

    var values = m.map(getAttrValue, attrNames, attrIndices);

    var card = m.zipmap(attrNames, values);

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
    // TODO seems sloppy to repeat the list of attributes in here,
    // what's the better way?
    return m.map(
        function(a) {return isAttrOK(cards, a)},
        m.vector("number", "shape", "fill", "color")
    );
}
function isAttrOK(cards, attr) {
    var relevant = m.map(function(card) {return m.get(card, attr);}, cards);
    var distinct = m.count(m.distinct(relevant));
    return distinct === 1 || distinct === m.count(cards);
}
