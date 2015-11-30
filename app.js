var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

server.listen(3000);

app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  res.render('index', {date: new Date().toDateString()});
})
