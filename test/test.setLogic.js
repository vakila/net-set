var assert = require('assert');
var mori = require('mori');
var setLogic = require('./../setLogic.js');

describe('makeDeck', function(){
    it('should return a mori vector', function(){
        assert(mori.isVector(setLogic.makeDeck()));
    });

    it('should return a vector with 81 elements', function(){
        assert.equal(mori.count(setLogic.makeDeck()),81);
    });

    it('should contain no duplicate elements', function(){
        //TODO Need to make sure that this test is sufficient
        assert.equal(mori.count(mori.distinct(setLogic.makeDeck())),81);
    })
})

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
        var card0 = setLogic.makeCard(0,0,0,0);
        var card1 = setLogic.makeCard(1,1,1,1);
        var card2 = setLogic.makeCard(2,2,2,2);
        var cardA = setLogic.makeCard(1,2,1,2);

        assert.equal(setLogic.isSet(mori.vector(card0,card1)), false);
        assert.equal(setLogic.isSet(mori.vector(card0,card1,card2,cardA)), false);
    });

    it('should accept three cards that are identical', function(){
        var card0 = setLogic.makeCard(0,0,0,0);
        var cardA = setLogic.makeCard(1,2,1,2);

        assert(setLogic.isSet(mori.vector(card0,card0,card0)));
        assert(setLogic.isSet(mori.vector(cardA,cardA,cardA)));
    });

    it('should accept three cards that are different in all ways', function(){
        var card0 = setLogic.makeCard(0,0,0,0);
        var card1 = setLogic.makeCard(1,1,1,1);
        var card2 = setLogic.makeCard(2,2,2,2);
        var cardA = setLogic.makeCard(1,2,1,2);
        var cardB = setLogic.makeCard(0,1,0,1);
        var cardC = setLogic.makeCard(2,0,2,0);

        assert(setLogic.isSet(mori.vector(card0,card1,card2)));
        assert(setLogic.isSet(mori.vector(cardA,cardB,cardC)));
    });

    it('should accept three cards that share two attributes but differ on two', function(){
        var card0 = setLogic.makeCard(0,0,0,0);
        var cardX = setLogic.makeCard(0,0,1,1);
        var cardY = setLogic.makeCard(0,0,2,2);

        assert(setLogic.isSet(mori.vector(card0,cardX,cardY)));
    });

    it('should accept three cards that share one attribute and differ on three', function() {
        var card0 = setLogic.makeCard(0,0,0,0);
        var cardD = setLogic.makeCard(0,1,1,1);
        var cardE = setLogic.makeCard(0,2,2,2);

        assert(setLogic.isSet(mori.vector(card0,cardD,cardE)));
    });

    it('should reject three cards where only two share an attribute', function() {
        var card0 = setLogic.makeCard(0,0,0,0);
        var card1 = setLogic.makeCard(1,1,1,1);
        var cardA = setLogic.makeCard(1,2,1,2);
        var card2 = setLogic.makeCard(2,2,2,2);
        var cardC = setLogic.makeCard(2,0,2,0);
        var cardD = setLogic.makeCard(0,1,1,1);
        var cardX = setLogic.makeCard(0,0,1,1);
        var cardY = setLogic.makeCard(0,0,2,2);

        assert(!setLogic.isSet(mori.vector(card0,card1,cardA)));
        assert(!setLogic.isSet(mori.vector(card2,cardC,cardD)));
        assert(!setLogic.isSet(mori.vector(cardD,cardX,cardY)));
    });

})
