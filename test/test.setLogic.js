var assert = require('assert');
var mori = require('mori');
var setLogic = require('./../setLogic.js');

describe('makeDeck', function(){
    it('should return a mori sequence', function(){
        assert(mori.isSeq(setLogic.makeDeck()));
    });

    it('should return a sequence with 81 cards', function(){
        var deck = setLogic.makeDeck();
        assert.equal(mori.count(deck),81);
        assert(mori.hasKey(mori.nth(deck,0), "number"));
    });

    it('should contain no duplicate cards', function(){
        //TODO Need to make sure that this test is sufficient
        assert.equal(mori.count(mori.distinct(setLogic.makeDeck())),81);
    });

    it('should contain cards in random order', function(){
        var shuffled = setLogic.makeDeck();
        // Can't think of a way to test this other than visual inspection
        mori.each(shuffled, function(c){ console.log("shuffled: ", c); });
    });

})

describe('makeCard', function() {
    it('should return a mori hashMap', function(){
        assert(mori.isMap(setLogic.makeCard(21, mori.vector(1,1,1,1))));
    });

    it('should return a hashMap with id and the four attribute names as keys', function(){
        var card1 = setLogic.makeCard(21, mori.vector(1,1,1,1));
        assert.equal(mori.count(mori.keys(card1)), 5);
        assert(mori.hasKey(card1, "number"));
        assert(mori.hasKey(card1, "shape"));
        assert(mori.hasKey(card1, "fill"));
        assert(mori.hasKey(card1, "color"));
        assert(mori.hasKey(card1, "id"));
    });

    it('should return a hashMap with the correct values', function() {
        var card0 = setLogic.makeCard(0, mori.vector(0,0,0,0));
        assert.equal(mori.get(card0, "color"), "red");
        assert.equal(mori.get(card0, "fill"), "solid");
        assert.equal(mori.get(card0, "number"), 1);
        assert.equal(mori.get(card0, "shape"), "diamond");
        assert.equal(mori.get(card0, "id"), 0);


        var card2 = setLogic.makeCard(35, mori.vector(1,2,1,2));
        assert.equal(mori.get(card2, "color"), "green");
        assert.equal(mori.get(card2, "fill"), "open");
        assert.equal(mori.get(card2, "number"), 2);
        assert.equal(mori.get(card2, "shape"), "rectangle");
        assert.equal(mori.get(card2, "id"), 35);

    });


})

describe('isSet', function(){

    var card0, card1, card2, cardA, cardB, cardC, cardD, cardE, cardX, cardY;

    beforeEach(function() {
        // runs before each test in this block
        card0 = setLogic.makeCard(0, mori.vector(0,0,0,0));
        card1 = setLogic.makeCard(1, mori.vector(1,1,1,1));
        card2 = setLogic.makeCard(2, mori.vector(2,2,2,2));
        cardA = setLogic.makeCard(3, mori.vector(1,2,1,2));
        cardB = setLogic.makeCard(4, mori.vector(0,1,0,1));
        cardC = setLogic.makeCard(5, mori.vector(2,0,2,0));
        cardD = setLogic.makeCard(8, mori.vector(0,1,1,1));
        cardE = setLogic.makeCard(9, mori.vector(0,2,2,2));
        cardX = setLogic.makeCard(6, mori.vector(0,0,1,1));
        cardY = setLogic.makeCard(7, mori.vector(0,0,2,2));
      });

    it('should reject more or less than three cards', function(){
        assert.equal(setLogic.isSet(mori.vector(card0,card1)), false);
        assert.equal(setLogic.isSet(mori.vector(card0,card1,card2,cardA)), false);
    });

    it('should accept three cards that are identical', function(){
        assert(setLogic.isSet(mori.vector(card0,card0,card0)));
        assert(setLogic.isSet(mori.vector(cardA,cardA,cardA)));
    });

    it('should accept three cards that are different in all ways', function(){
        assert(setLogic.isSet(mori.vector(card0,card1,card2)));
        assert(setLogic.isSet(mori.vector(cardA,cardB,cardC)));
    });

    it('should accept three cards that share two attributes but differ on two', function(){
        assert(setLogic.isSet(mori.vector(card0,cardX,cardY)));
    });

    it('should accept three cards that share one attribute and differ on three', function() {
        assert(setLogic.isSet(mori.vector(card0,cardD,cardE)));
    });

    it('should reject three cards where only two share an attribute', function() {
        assert(!setLogic.isSet(mori.vector(card0,card1,cardA)));
        assert(!setLogic.isSet(mori.vector(card2,cardC,cardD)));
        assert(!setLogic.isSet(mori.vector(cardD,cardX,cardY)));
    });

})
