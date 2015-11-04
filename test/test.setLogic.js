var assert = require('assert');
var mori = require('mori');
var setLogic = require('./../setLogic.js');

describe('makeCard', function() {
    it('should return a mori hashMap', function(){
        assert(mori.isMap(setLogic.makeCard(1,1,1,1)));
    });

    it('should return a hashMap with the four attribute names as keys', function(){
        assert.equal(mori.intoArray(mori.keys(setLogic.makeCard(1,1,1,1))),
            ["number", "shape", "fill", "color"]
        );
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
