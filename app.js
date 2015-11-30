var express = require('express');
var http = require('http');
var socketIO = require('socket.io');
var path = require('path');
var m = require('mori');
var game = require('./game.js');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');

app.use(express.static('public'));

var gameState = game.getInitialState();

app.get('/', function(req, res) {
  var stateObject = m.toJs(gameState);
  console.log('initialState:', stateObject);
  res.render('index', stateObject);
});

io.on('connection', function(socket){
  console.log('CONNECT', socket.id);
  socket.on('log on', function(name){
    console.log('LOG ON', name);
    gameState = game.addPlayer(name, gameState);
    console.log('gameState.players:', m.get(gameState, 'players'));
    socket.broadcast.emit('log on', name);
  })
  socket.on('log off', function(name) {
    console.log('LOG OFF', name);
    gameState = game.removePlayer(name, gameState);
    console.log('gameState.players:', m.get(gameState, 'players'));
    socket.broadcast.emit('log off', name);
  })
  socket.on('disconnect', function(){
    console.log('DISCONNECT', socket.id);
  });
  socket.on('card click', function(click){
    console.log('CARD CLICK', click.user, click.card);
    io.emit('card click', click);
  });
});

server.listen(3000, function() {
  console.log("listening on port 3000");
});
