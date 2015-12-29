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
    it('should have no effect if the card was already claimed', function() {
        var state = game.addPlayer('Leia', 1, game.getInitialState());
        var claimedState = game.claimCard('Leia', 2, game.claimCard('Leia', 3, state));
        var claimed = m.getIn(claimedState, ['players', 'Leia', 'claimed']);
        var reclaimedState = game.claimCard('Leia', 3, claimedState);
        var claimed = m.getIn(reclaimedState, ['players', 'Leia', 'claimed']);
        assert.equal(m.count(claimed), 2);
    })
});

describe('unclaimCard', function() {
    it('should remove the card object from the players.player.claimed set', function(){
        var state = game.addPlayer('Leia', 1, game.getInitialState());
        var claimedState = game.claimCard('Leia', 1, game.claimCard('Leia', 2, game.claimCard('Leia', 3, state)));
        var unclaimedState = game.unclaimCard('Leia', 2, claimedState);
        var claimed = m.getIn(unclaimedState, ['players', 'Leia', 'claimed']);
        assert.equal(m.count(claimed), 2);
        assert.equal(m.count(m.intersection(claimed, m.set([m.nth(m.get(claimedState, 'deck'), 2)]))), 0);
    });
    it('should have no effect if the card was never claimed', function() {
        var state = game.addPlayer('Leia', 1, game.getInitialState());
        var claimedState = game.claimCard('Leia', 2, game.claimCard('Leia', 3, state));
        var unclaimedState = game.unclaimCard('Leia', 4, claimedState);
        var claimed = m.getIn(unclaimedState, ['players', 'Leia', 'claimed']);
        assert.equal(m.count(claimed), 2);
    });
});

describe('toggleClaimed', function() {
    it('should remove the card if it was in players.player.claimed', function(){
        var state = game.addPlayer('Leia', 1, game.getInitialState());
        var claimedState = game.claimCard('Leia', 1, game.claimCard('Leia', 2, game.claimCard('Leia', 3, state)));
        var toggledState = game.toggleClaimed('Leia', 2, claimedState);
        var claimed = m.getIn(toggledState, ['players', 'Leia', 'claimed']);
        assert.equal(m.count(claimed), 2);
        assert.equal(m.count(m.intersection(claimed, m.set([m.nth(m.get(claimedState, 'deck'), 2)]))), 0);
    });
    it('should add the card if it was not in players.player.claimed', function() {
        var state = game.addPlayer('Leia', 1, game.getInitialState());
        var claimedState = game.claimCard('Leia', 2, game.claimCard('Leia', 3, state));
        var toggledState = game.toggleClaimed('Leia', 4, claimedState);
        var claimed = m.getIn(toggledState, ['players', 'Leia', 'claimed']);
        assert.equal(m.count(claimed), 3);
        assert.equal(m.count(m.intersection(claimed, m.set([m.nth(m.get(claimedState, 'deck'), 4)]))), 1);
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

describe.skip('checkForSet', function() {
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

describe.skip('emptyClaimed', function() {
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

describe('processCandidate', function() {
    var state;
    beforeEach(function() {
        state = game.addPlayer('Leia', 2, game.addPlayer('Luke', 3, game.getInitialState()));

        state = m.assocIn(state, ['board', 'A'], 0);
        state = m.assocIn(state, ['board', 'B'], 1);
        state = m.assocIn(state, ['board', 'C'], 2);
        state = m.assocIn(state, ['board', 'D'], 3);
        // console.log("Board:", m.get(state, 'board'));

        state = game.claimCard('Leia', 1, game.claimCard('Leia', 2, game.claimCard('Leia', 0, state)));
        // console.log('Leia claimed:', m.getIn(state, ['players', 'Leia', 'claimed']));
        // game.checkForSet('Leia', state);
        // console.log("Leia score:", m.getIn(state, ['players', 'Leia', 'score']));

        state = game.claimCard('Luke', 1, game.claimCard('Luke', 2, game.claimCard('Luke', 3, state)));
        // console.log('Luke claimed:', m.getIn(state, ['players', 'Luke', 'claimed']));
        // game.checkForSet('Luke', state);
        // console.log("Luke score:", m.getIn(state, ['players', 'Luke', 'score']));
    });

    it('should return a mori hashMap with the appropriate keys', function(){
        var setData = game.processCandidate('Luke', state);
        // console.log(setData);
        assert(m.isMap(setData));
        assert(m.hasKey(setData, 'user'));
        assert(m.hasKey(setData, 'set'));
        assert(m.hasKey(setData, 'gameState'));
        assert(m.hasKey(setData, 'event'));
    });
    it('should return the correct set found|failed event', function() {
        var lukeData = game.processCandidate('Luke', state);
        assert.equal(m.get(lukeData, 'event'), 'set failed');
        var leiaData = game.processCandidate('Leia', state);
        assert.equal(m.get(leiaData, 'event'), 'set found');
    });
    it('should return gameState object with correctly updated score', function() {
        var lukeData = game.processCandidate('Luke', state);
        assert.equal(m.getIn(lukeData, ['gameState', 'players', 'Luke', 'score']), -1);
        var lukeData = game.processCandidate('Leia', state);
        assert.equal(m.getIn(lukeData, ['gameState', 'players', 'Leia', 'score']), 1);
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

describe.skip('discardSet', function() {
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

describe.skip('downsizeIfNeeded', function() {
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
        console.log("state1 board:", game.sortBoard(m.get(state1, 'board')));
        console.log("state1D board:", game.sortBoard(m.get(state1D, 'board')));
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
        console.log("state2 board:", game.sortBoard(m.get(state2, 'board')));
        console.log("state2D board:", game.sortBoard(m.get(state2D, 'board')));
        assert.equal(m.equals(state2D, state2), false);
        assert(m.getIn(state2D, ['board', 'D']));
        assert.equal(m.getIn(state2D, ['board', 'P']), null);
    });
    it('should not mistakenly discard card 0', function() {
        var board1 = m.pipeline(board0,
            m.curry(m.assoc, 'C', 0),
            m.curry(m.assoc, 'D', null),
            m.curry(m.assoc, 'P', 103)
        );
        var state1 = m.assoc(state0, 'board', board1);
        var state1D = game.downsizeIfNeeded(state1);
        console.log("state1 board:", game.sortBoard(m.get(state1, 'board')));
        console.log("state1D board:", game.sortBoard(m.get(state1D, 'board')));
        assert.equal(m.equals(state1D, state1), false);
        assert.equal(m.getIn(state1D, ['board', 'C']), 0);
        assert(m.getIn(state1D, ['board', 'D']));
        assert.equal(m.getIn(state1D, ['board', 'P']), null);
    });
});

describe.skip('refillIfNeeded', function() {
    var state0;
    before(function() {
        state0 = game.startBoard(game.getInitialState());
    });
    it('should do nothing if the first 12 slots are full', function() {
        assert(m.equals(state0, game.refillIfNeeded(state0)));
        var state1 = m.pipeline(state0,
            m.curry(m.assocIn, ['board', 'M'], 100),
            m.curry(m.assocIn, ['board', 'N'], 101),
            m.curry(m.assocIn, ['board', 'O'], 102)
        );
        assert(m.equals(state1, game.refillIfNeeded(state1)));
        var state2 = m.pipeline(state1,
            m.curry(m.assocIn, ['board', 'P'], 103),
            m.curry(m.assocIn, ['board', 'Q'], 104),
            m.curry(m.assocIn, ['board', 'R'], 105)
        );
        assert(m.equals(state2, game.refillIfNeeded(state2)));
    });
    it('should deal new cards to openings in the first 12 slots', function() {
        var state1 = m.pipeline(state0,
            m.curry(m.assocIn, ['board', 'A'], null),
            m.curry(m.assocIn, ['board', 'B'], null),
            m.curry(m.assocIn, ['board', 'C'], null)
        );
        var state1R = game.refillIfNeeded(state1);
        console.log("state1R board:", game.sortBoard(m.get(state1R, 'board')));
        assert.equal(m.equals(state1, state1R), false);
        m.each(m.vector('A', 'B', 'C'), function(slot) {
            assert(m.getIn(state1R, ['board', slot]));
        });

        var state2 = m.pipeline(state0,
            m.curry(m.assocIn, ['board', 'D'], null),
            m.curry(m.assocIn, ['board', 'H'], null),
            m.curry(m.assocIn, ['board', 'K'], null)
        );
        var state2R = game.refillIfNeeded(state2);
        console.log("state2R board:", game.sortBoard(m.get(state2R, 'board')));
        assert.equal(m.equals(state2, state2R), false);
        m.each(m.vector('D', 'H', 'K'), function(slot) {
            assert(m.getIn(state2R, ['board', slot]));
        });

    });
});
