var mori = require('mori');


exports.makeCard = function(number, shape, fill, color) {
    // number, shape, fill, and color are integers representing the attribute indices
    // e.g. makeCard(1, 1, 1, 1);

    var ATTRIBUTES = mori.hashMap(
        "number", mori.vector(1, 2, 3),
        "shape", mori.vector("diamond", "pill", "rectangle"),
        "fill", mori.vector("solid", "shaded", "open"),
        "color", mori.vector("red", "green", "purple")
    );

    // this does not work:
    // var values = mori.map(function(attrVector, attrIndex) {
    //     return mori.nth(attrVector, attrIndex);
    // }, mori.vector(mori.keys(ATTRIBUTES)), mori.vector(number,shape,fill,color)
    // );

    var card = mori.hashMap(mori.interleave(mori.keys(ATTRIBUTES), values))

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

function areAttrsOK(threeCards) {
    // TODO seems sloppy to repeat the list of attributes in here,
    // what's the better way?
    return mori.vector(["number", "shape", "fill", "color"]).map(
        function(a) {return isAttrOK(threeCards, a)}
    );
}

function isAttrOK(threeCards, attr) {
    var relevant = threeCards.map(function(c) {return c[attr];});
    return mori.count(mori.set(relevant));
}
