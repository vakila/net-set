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

describe('emptyClaimed', function() {
    it('should make gameState.players.player.claimed an empty set', function(){
        var state1 = game.addPlayer('Anjana', 5, game.getInitialState());
        var claimedState = m.reduce(function(state, cardID) {
            return game.claimCard('Anjana', cardID, state);
        }, state1, m.range(1, 4));
        var emptyState = game.emptyClaimed(claimedState, 'Anjana');
        var claimed = m.getIn(emptyState, ['players', 'Anjana', 'claimed']);
        assert(m.isSet(claimed));
        assert.equal(m.count(claimed), 0);
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

describe.skip('needsDownsize', function() {
    var board0;
    before(function() {
        board0 = m.get(game.startBoard(game.getInitialState()), 'board');
    });
    it('should return false if the first 12 slots are full', function(){
        assert.equal(game.needsDownsize(board0), false);
        var board1 = m.pipeline(board0,
            m.curry(m.assoc, 'M', 100),
            m.curry(m.assoc, 'N', 101),
            m.curry(m.assoc, 'O', 102)
        );
        assert.equal(game.needsDownsize(board1), false);
        var board2 = m.pipeline(board1,
            m.curry(m.assoc, 'P', 103),
            m.curry(m.assoc, 'Q', 104),
            m.curry(m.assoc, 'R', 105)
        );
        assert.equal(game.needsDownsize(board2), false);
    });
    it('should return false if the last 6 slots are empty', function(){
        assert.equal(game.needsDownsize(board0), false);
        var board1 = m.pipeline(board0,
            m.curry(m.assoc, 'A', null),
            m.curry(m.assoc, 'B', null),
            m.curry(m.assoc, 'C', null)
        );
        assert.equal(game.needsDownsize(board1), false);
    });
    it('should return true if there are cards above openings', function(){
        var board1 = m.pipeline(board0,
            m.curry(m.assoc, 'A', null),
            m.curry(m.assoc, 'B', null),
            m.curry(m.assoc, 'C', null),
            m.curry(m.assoc, 'M', 100),
            m.curry(m.assoc, 'N', 101),
            m.curry(m.assoc, 'O', 102)
        );
        assert(game.needsDownsize(board1));
        var board2 = m.pipeline(board0,
            m.curry(m.assoc, 'D', null),
            m.curry(m.assoc, 'P', 103)
        );
        assert(game.needsDownsize(board2));

    });
});

describe('downsizeIfNeeded', function() {
    var state0, board0;
    before(function() {
        state0 = game.startBoard(game.getInitialState());
        board0 = m.get(state0, 'board');
    });
    it('should do nothing to a board with no cards above openings', function(){
        assert(m.equals(game.downsizeIfNeeded(state0), state0));
        var board1 = m.pipeline(board0,
            m.curry(m.assoc, 'M', 100),
            m.curry(m.assoc, 'N', 101),
            m.curry(m.assoc, 'O', 102)
        );
        var state1 = m.assoc(state0, 'board', board1);
        assert(m.equals(game.downsizeIfNeeded(state1), state1));
        var board2 = m.pipeline(board1,
            m.curry(m.assoc, 'P', 103),
            m.curry(m.assoc, 'Q', 104),
            m.curry(m.assoc, 'R', 105)
        );
        var state2 = m.assoc(state0, 'board', board2);
        assert(m.equals(game.downsizeIfNeeded(state2), state2));
    });
    it('should consolidate a board with cards above openings', function() {
        var board1 = m.pipeline(board0,
            m.curry(m.assoc, 'A', null),
            m.curry(m.assoc, 'B', null),
            m.curry(m.assoc, 'C', null),
            m.curry(m.assoc, 'M', 100),
            m.curry(m.assoc, 'N', 101),
            m.curry(m.assoc, 'O', 102)
        );
        var state1 = m.assoc(state0, 'board', board1);
        var state1D = game.downsizeIfNeeded(state1);
        console.log("state1 board:", m.get(state1, 'board'));
        console.log("state1D board:", m.get(state1D, 'board'));
        assert.equal(m.equals(state1D, state1), false);
        m.each(m.vector('A', 'B', 'C'), function(slot) {
            assert(m.getIn(state1D, ['board', slot]));
        });
        m.each(m.vector('M', 'N', 'O'), function(slot) {
            assert.equal(m.getIn(state1D, ['board', slot]), null);
        });

        var board2 = m.pipeline(board0,
            m.curry(m.assoc, 'D', null),
            m.curry(m.assoc, 'P', 103)
        );
        var state2 = m.assoc(state0, 'board', board2);
        var state2D = game.downsizeIfNeeded(state2);
        console.log("state2 board:", m.get(state2, 'board'));
        console.log("state2D board:", m.get(state2D, 'board'));
        assert.equal(m.equals(state2D, state2), false);
        assert(m.getIn(state2D, ['board', 'D']));
        assert.equal(m.getIn(state2D, ['board', 'P']), null);
    });
});
