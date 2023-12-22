var express = require('express');
var app = express();
var https = require('https');
var http = require('http');
var mysql = require('mysql');
var fs = require('fs');
const cors = require ('cors');
app.use (cors ());
var options = {
  key: fs.readFileSync('https-keys/private.key'),
  cert: fs.readFileSync('https-keys/certificate.crt')
};


var players = [];
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
var server = https.createServer(options,app);
server.listen(443,  () => {
  console.log(`Server is up and running at https 443`);
  console.log(`End of index.js`);
});

var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "everest"
});
var io = require('socket.io')(server);

io.on('connection', function (socket) {
    socket.on('disconnect', function () {
      console.log('user disconnected');
    });

    socket.on('addScore' , function(userName , score){
        console.log(userName , score);
        var insert_sql = "INSERT INTO user (username , score) VALUES ('" + userName + "','" + score + "') ON DUPLICATE KEY UPDATE score = '" + score +"'";
        con.query(insert_sql ,function(err){

          var get_sql = "SELECT * FROM user";
          con.query(get_sql, function (err, result, fields) {
            players = result;
            socket.emit('scoreboard' , players);
            socket.broadcast.emit('scoreboard' , players);
          });

        });


    });
    socket.on('connected' , function(userName){
      console.log(userName + " : connected");
    })
    socket.on('scoreboard' , function(){
        var get_sql = "SELECT * FROM user";
        con.query(get_sql, function (err, result, fields) {
          players = result;
          socket.emit('scoreboard' , players);
        });
    })
});