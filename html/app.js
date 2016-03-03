var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('/index.html');
});

var playerCount = 0;
var id = 0;

io.on('connection', function (socket) {
  playerCount++;
  id++;
  console.log("Player connected");
  setTimeout(function () {
    socket.emit('connected', { playerId: id });
    io.emit('count', { playerCount: playerCount });
  }, 1500);

  socket.on('disconnect', function () {
    playerCount--;
    io.emit('count', { playerCount: playerCount });
  });

  socket.on('update', function (data) {
    socket.broadcast.emit('updated', data);
  });

  socket.on('shoot', function (data) {
    socket.broadcast.emit('shooted', data);
  });

  socket.on('addtokillfeed', function (data) {
    socket.broadcast.emit('appendkillfeed', data);
  });

  socket.on('kill', function (data) {
    socket.broadcast.emit('killed', data);
  });
});

server.listen(80);
console.log("Multiplayer app listening on port 80");
