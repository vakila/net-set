var assert = require('assert');
var mori = require('mori');
var setLogic = require('./../setLogic.js');

describe('makeCard', function() {
    it('should return a mori hashMap', function(){
        assert(mori.isMap(setLogic.makeCard(1,1,1,1)));
    });

    it('should return a hashMap with the four attribute names as keys', function(){
        var card1 = setLogic.makeCard(1,1,1,1);
        assert.equal(mori.count(mori.keys(card1)), 4);
        assert(mori.hasKey(card1, "number"));
        assert(mori.hasKey(card1, "shape"));
        assert(mori.hasKey(card1, "fill"));
        assert(mori.hasKey(card1, "color"));
    });

    it('should return a hashMap with the correct values', function() {
        var card0 = setLogic.makeCard(0,0,0,0);
        assert.equal(mori.get(card0, "number"), 1);
        assert.equal(mori.get(card0, "shape"), "diamond");
        assert.equal(mori.get(card0, "fill"), "solid");
        assert.equal(mori.get(card0, "color"), "red");

        var card2 = setLogic.makeCard(1,2,1,2);
        assert.equal(mori.get(card2, "number"), 2);
        assert.equal(mori.get(card2, "shape"), "rectangle");
        assert.equal(mori.get(card2, "fill"), "shaded");
        assert.equal(mori.get(card2, "color"), "purple");

    });


})

describe('isSet', function(){

    it('should reject more or less than three cards', function(){
      assert.equal(setLogic.isSet([1, 2]), false);
      assert.equal(setLogic.isSet([1,2,3,4]), false);
    });

    it('should accept three cards that are identical');

    it('should accept three cards that are different in all ways');

    it('should accept three cards that share two attributes but differ on a third');

    it('should accept three cards that share one attribute and differ on two');

    it('should reject three cards where only two share an attribute');

})
