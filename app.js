var express = require('express');
var http = require('http');
var socketIO = require('socket.io');
var path = require('path');
var game = require('./game.js');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');

app.use(express.static('public'));

app.get('/', function(req, res) {
  var state0 = game.getInitialState()
  res.render('index', state0);
})

server.listen(3000, function() {
  console.log("listening on port 3000");
});
