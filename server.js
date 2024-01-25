var express = require('express');
var app = express();
var https = require('https');
const bodyParser = require('body-parser');
var http = require('http');
var mysql = require('mysql');
var fs = require('fs');
const cors = require ('cors');
app.use (cors ());
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
var options = {
  key: fs.readFileSync('https-keys/private.key'),
  cert: fs.readFileSync('https-keys/certificate.crt')
};
var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "everest"
});

var players = [];
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/game', function (req, res) {
  res.sendFile(__dirname + '/public/game.html');
});
app.get('/signup', function (req, res) {
  res.sendFile(__dirname + '/public/signup.html');
});
app.post('/signup' , function(req, res){
  const { name, password , code} = req.body;
  console.log(name , password , code);
  var delete_sql = "DELETE FROM code WHERE code ='" + code +"'";
  var select_sql = "SELECT * FROM code WHERE code = '" + code + "'";
  con.query(select_sql, function (error, rows , fields) {
    console.log(rows);
    if(rows.length != 0){
      con.query(delete_sql , function(error , rows, fields){
        if (!error) {
            console.log('Successful deleted!! \n');
            select_sql = "SELECT * FROM user WHERE username ='" + name +"'";
            con.query(select_sql, function (err, result) {
              console.log(result);
              if(result.length != 0){
                res.status(404).send({ success: false , message : "User already exists" });
              }else{
                var insert_sql = "INSERT INTO  user (username , password) VALUES ( '" + name + "' , '" + password + "')" ;
                con.query(insert_sql, function (err, result) {
                  if(!err){
                    res.status(200).send({ success: true });
                  }else{
                    res.status(404).send({ success: false , message : "Unable to create account"});
                  }
              
                });
              }
            });            
        }
        else {
        }
      });
    }else{
      console.log('Error in deleting');
      res.status(404).json({ success: false , message : "Invalid UniqueCode" });
    }
  });
})
app.post('/login' , function(req, res){
  const { email, password } = req.body;
  var select_sql = "SELECT password FROM user WHERE username ='" + email +"'";
  con.query(select_sql, function (err, result) {
    if(result[0].password == password){
      res.status(200).send({ success: true });
    }else{
      res.status(404).send({ success: false });
    }

  });
})
var server = https.createServer(options,app);
server.listen(443,  () => {
  console.log(`Server is up and running at https 443`);
  console.log(`End of index.js`);
});

var io = require('socket.io')(server);

io.on('connection', function (socket) {
    socket.on('disconnect', function () {
      console.log('user disconnected');
    });

    socket.on('addScore' , function(userName , score , flagX , flagY){
        //var insert_sql = "INSERT INTO user (username , score) VALUES ('" + userName + "','" + score + "') ON DUPLICATE KEY UPDATE score = '" + score +"'";
        var select_sql = "SELECT score , x , y FROM user WHERE username ='" + userName +"'";
        var insert_sql = "UPDATE user SET score=" + score + "," + "x= " + flagX + ", y=" + flagY + "WHERE username = '" + userName + "'";
        con.query(select_sql, function (err, result) {
          let x = result[0].x;
          let y = result[0].y;
          if(y > flagY || result[0].score == 0){
              con.query(insert_sql , function(err , result){
                  console.log(result);
                  socket.emit('score' , score , flagX , flagY);
              })
          }
      
        });        
    });
    socket.on('connected' , function(userName){
      console.log(userName + " : connected");
    })
    socket.on('score' , function(userName){
      var select_sql = "SELECT score , x , y FROM user WHERE username ='" + userName +"'";
      con.query(select_sql , function(err , result){
        let score = result[0].score;
        socket.emit('score' , score , result[0].x , result[0].y);
    })
    })
});