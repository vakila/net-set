var mori = require('mori');

exports.isSet = function(threeCards) {
    if (threeCards.length !== 3) {
        return false;
    }

    var attrChecks = ["name", "shape", "fill", "color"].map(
        function(a) {return isAttrOK(threeCards, a)}
        )

    return attrChecks.reduce(
        function(first, next) { return first && next;}
        )
}

function isAttrOK(threeCards, attr) {
    var relevant = threeCards.map(function(c) {return c[attr];});
    return allSame(relevant) || allDifferent(relevant);
}
