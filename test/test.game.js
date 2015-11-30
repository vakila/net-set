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
    it('should have a players map', function(){
        var state = game.getInitialState();
        assert(m.hasKey(state, 'players'));
        assert(m.isMap(m.get(state, 'players')));
    });
});

describe('addPlayer', function(){
    it('should add the name to the players hashMap', function(){
        var state0 = game.getInitialState();
        var state1 = game.addPlayer('Anjana', state0);
        assert(m.hasKey(m.get(state1, 'players'), 'Anjana'));
    });
    it('should associate the name in players with a proper hashMap', function(){
        var state0 = game.getInitialState();
        var state1 = game.addPlayer('Anjana', state0);
        var playerMap = m.getIn(state1, ['players', 'Anjana']);
        assert(m.isMap(playerMap));
        assert(m.hasKey(playerMap, 'score'));
        assert(m.hasKey(playerMap, 'claimed'));
        assert.equal(m.get(playerMap, 'score'), 0);
        assert.equal(m.get(playerMap, 'claimed'), m.set());
    });
});

describe('removePlayer', function(){
    it('should remove the name from the players hashMap', function(){
        var state0 = game.getInitialState();
        var added = game.addPlayer('Anjana', state0);
        var removed = game.removePlayer('Anjana', added);
        assert.equal(m.hasKey(m.get(removed, 'players')), false);
    });
});
