var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var players = {};
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});

io.on('connection', function (socket) {
    console.log(socket.id + '  : user connected');
    players[socket.id] = {
        id : socket.id,
        score : 0
    }
    socket.on('disconnect', function () {
      console.log('user disconnected');
    });

    socket.on('addScore' , function(userId , score){
        console.log(userId , score);
        players[userId].score = score;
        socket.emit('scoreboard' , players);
        socket.broadcast.emit('scoreboard' , players);
    });

    socket.on('scoreboard' , function(){
        socket.emit('scoreboard' , players);
    })
});