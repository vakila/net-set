var assert = require('assert');
var m = require('mori');
var game = require('./../game.js');


describe('getInitialState', function(){
    it('should return a mori hashMap', function(){
        assert(m.isMap(game.getInitialState()));
    });
    it('should have a deck with 81 cards and a toDeal with 81 shuffled integers', function(){
        var state = game.getInitialState();
        var toDeal = m.get(state, 'toDeal');
        var deck = m.get(state, 'deck')
        assert.equal(m.count(toDeal), 81);
        assert.equal(m.nth(toDeal,0)===0, false);
        assert.equal(m.count(deck), 81);
        assert(m.hasKey(m.nth(deck,0), "color"));
    });
    it('should have a players map', function(){
        var state = game.getInitialState();
        assert(m.hasKey(state, 'players'));
        assert(m.isMap(m.get(state, 'players')));
    });
    it('should have a board map with 18 keys', function(){
        var state = game.getInitialState();
        assert(m.hasKey(state, 'board'));
        var board = m.get(state, 'board');
        assert(m.isMap(board));
        assert.equal(m.count(m.keys(board)), 18);
    });
});

describe('addPlayer', function(){
    it('should add the name to the players hashMap', function(){
        var state0 = game.getInitialState();
        var state1 = game.addPlayer('Anjana', 1, state0);
        assert(m.hasKey(m.get(state1, 'players'), 'Anjana'));
    });
    it('should associate the name in players with a proper hashMap', function(){
        var state0 = game.getInitialState();
        var state1 = game.addPlayer('Anjana', 1, state0);
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
        var added = game.addPlayer('Anjana', 1, state0);
        var removed = game.removePlayer('Anjana', added);
        assert.equal(m.hasKey(m.get(removed, 'players')), false);
    });
});

describe('claimCard', function(){
    it('should add the card object to the players.player.claimed set', function(){
        var state = game.addPlayer('Anjana', 1, game.getInitialState());
        var claimedState = game.claimCard('Anjana', 3, state);
        var claimed = m.getIn(claimedState, ['players', 'Anjana', 'claimed']);
        assert.equal(m.count(claimed), 1);
        assert(m.hasKey(m.first(claimed), 'color'));
        assert(m.equals(m.first(claimed), m.nth(m.get(claimedState, 'deck'), 3)));
    });
});

describe('checkForCandidate', function() {
    var state;
    beforeEach(function() {
        state = game.addPlayer('Leia', 2, game.addPlayer('Luke', 3, game.getInitialState()));
    });

    it('should return true if player has 3 claimed cards', function() {
        var claimedState = game.claimCard('Leia', 1, game.claimCard('Leia', 2, game.claimCard('Leia', 3, state)));
        assert(game.checkForCandidate('Leia', claimedState));
    });

    it('should return false if player has more or less than 3 cards', function() {
        var claimedState = game.claimCard('Leia', 1, game.claimCard('Leia', 2, game.claimCard('Leia', 3, game.claimCard('Leia', 4, state))));
        claimedState = game.claimCard('Luke', 1, state);
        assert.equal(game.checkForCandidate('Leia', claimedState), false);
        assert.equal(game.checkForCandidate('Luke', claimedState), false);
    });
});

describe('checkForSet', function() {
    // it('should return null if player has less than 3 claimed cards', function(){
    //     var state = game.addPlayer('Anjana', 5, game.getInitialState());
    //     assert.equal(game.checkForSet('Anjana', state), null);
    // });
    it('should return boolean if player has 3 cards', function(){
        var state = game.addPlayer('Anjana', 5, game.getInitialState());
        var claimedState = game.claimCard('Anjana', 1, game.claimCard('Anjana', 2, game.claimCard('Anjana', 3, state)));
        assert.equal(typeof(game.checkForSet('Anjana', claimedState)), 'boolean');
    });
});
