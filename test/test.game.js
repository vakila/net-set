var assert = require('assert');
var mori = require('mori');
var game = require('./../game.js');


describe('getInitialState', function(){
    it('should return a JS object', function(){
        assert.equal(typeof(game.getInitialState()), 'object');
    });
    it('should include 12 dealt and 69 undealt cards', function(){
        var state = game.getInitialState();
        assert.equal(mori.count(state.dealt), 12);
        assert(mori.hasKey(mori.nth(state.dealt,0), "color"));
        assert.equal(mori.count(state.undealt), 69);
        assert(mori.hasKey(mori.nth(state.undealt,0), "color"));
    });
});
