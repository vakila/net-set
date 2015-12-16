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

describe('startBoard', function() {
    var state;
    beforeEach(function() {
        state = game.startBoard(game.getInitialState());
    })
    it('should assoc the first 12 board slots with a cardID', function(){
        var fullSlots = m.vector('A', 'B', 'C', 'D', 'E', 'F',
            'G', 'H', 'I', 'J', 'K', 'L');
        var emptySlots = m.vector('M', 'N', 'O', 'P', 'Q', 'R');

        m.each(fullSlots, function(slot) {
            var newValue = m.getIn(state, ['board', slot]);
            // console.log(slot, newValue);
            assert(newValue !== null);
            assert(newValue >= 0 && newValue < 81);
        });

        m.each(emptySlots, function(slot) {
            var newValue = m.getIn(state, ['board', slot]);
            // console.log(slot, newValue);
            assert(newValue === null);
        })

    });
    it('should result in toDeal having 69 cards left', function(){
        var toDeal = m.get(state, 'toDeal');
        assert.equal(m.count(toDeal), 69);
    });
});

describe('discardSet', function() {
    var discardState;
    before(function() {
        var state0 = game.getInitialState();
        var newBoard = m.pipeline(
            m.get(state0, 'board'),
            m.curry(m.assoc, 'A', 1),
            m.curry(m.assoc, 'B', 2),
            m.curry(m.assoc, 'C', 3),
            m.curry(m.assoc, 'D', 4),
            m.curry(m.assoc, 'E', 5),
            m.curry(m.assoc, 'F', 6),
            m.curry(m.assoc, 'G', 7),
            m.curry(m.assoc, 'H', 8),
            m.curry(m.assoc, 'I', 9),
            m.curry(m.assoc, 'J', 10),
            m.curry(m.assoc, 'K', 11),
            m.curry(m.assoc, 'L', 12)
        );
        // console.log(newBoard)
        var state = m.assocIn(state0, ['board'], newBoard);
        var deck = m.get(state, 'deck');
        discardState = game.discardSet(state, m.set(m.map(function(id) {
            return m.nth(deck, id);
        }, m.vector(1, 2, 3))));
    });
    it('should remove the cardIDs from the appropriate slots', function(){
        // console.log('board:', m.get(discardState, 'board'));
        m.each(m.vector('A', 'B', 'C'), function(slot) {
            // console.log("testing slot", slot);
            assert.equal(m.getIn(discardState, ['board', slot]), null);
        });
    });
    it('should not change the other slots', function(){
        // console.log('board:', m.get(discardState, 'board'));
        var safeSlots = m.vector('D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L')
        m.each(m.vector(0,1,2,3,4,5,6,7,8),
            function(index) {
                var slot = m.nth(safeSlots, index);
                assert.equal(m.getIn(discardState, ['board', slot]), index+4);
            });
    });
});
