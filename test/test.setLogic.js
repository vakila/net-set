var assert = require('assert');
var setLogic = require('./../setLogic.js');

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
