var assert = require('assert');
var m = require('mori');
var game = require('./../game.js');


describe('getInitialState', function(){
    it('should return a mori hashMap', function(){
        assert(m.isMap(game.getInitialState()));
    });
    it('should include 12 dealt and 69 undealt cards', function(){
        var state = game.getInitialState();
        var dealt = m.get(state, 'dealt');
        var undealt = m.get(state, 'undealt')
        assert.equal(m.count(dealt), 12);
        assert(m.hasKey(m.nth(dealt,0), "color"));
        assert.equal(m.count(undealt), 69);
        assert(m.hasKey(m.nth(undealt,0), "color"));
    });
});
