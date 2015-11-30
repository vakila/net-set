var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var game = require('./game.js');

server.listen(3000, function() {
  console.log("listening on port 3000");
});

app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  var state0 = game.getInitialState()
  res.render('index', state0);
})
