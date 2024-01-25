// create a new scene named "Game"
import { freelizer } from './freelizer/index.js'
const { start, subscribe , stop , getSource} = await freelizer()


let gameScene = new Phaser.Scene('Game');
// our game's configuration
let config = {
  type: Phaser.AUTO,  //Phaser will decide how to render our game (WebGL or Canvas)
  width: 1920, // game width
  height: 1080, // game height
  scene: gameScene, // our newly created scene
  id: 'game-div',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
// create the game, and pass it the configuration
let button_play;
let play_clicked = false;
let playButtonDown;
let playButtonUp;
let clock;
let countdown = false;
let noteText , resultText , timeText;
let game = new Phaser.Game(config);
let limitCounts = 25;
let totalScore = 0;
let bestScore = 0;
let dis = [1694 , 323 , 1435 , 554 , 1345 , 606 , 1246 ,696 , 1195 , 743 , 1158 , 782 , 1115 , 819 , 1076 , 883 , 1044 , 905 , 1032 , 924 , 1018 , 971];
let forwardDis = 0;
let noteDisplay = true;
let temp_processnote;
let preparing = true;

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
let note_i = 0 , processNotes;

let voiceActive = false;
let gameActive = false;
let resultNotes = [];
let startSeconds = 0;
let endSeconds = 0;
let moveActive = false;
let notesCount = 0;
let heartCount = 3;
let scores = [];
let flagX=215 , flagY = 875 ,playerX , playerY;

let  keyD , isDead = false;


let self;
let user = "";
let totalNote = 0 , totalTime = 0;
let gameStartTime = 0 , gameEndTime = 0;


let noteFinishedTime , playedTime;

gameScene.init = function(){
    this.playerSpeed = 0.2;
    this.playerDirect = 1;
    this.playerHigh = 0;
    this.heart = [];
}
gameScene.preload = function() {

    //loading Screen
    var progressBar = this.add.graphics();
    var progressBox = this.add.graphics();
        
    var width = this.cameras.main.width;
    var height = this.cameras.main.height;

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width/2 - 160, 270, 320, 50);

    var loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Loading...',
        style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    var percentText = this.make.text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
    });
    percentText.setOrigin(0.5, 0.5);
    
    var assetText = this.make.text({
        x: width / 2,
        y: height / 2 + 50,
        text: '',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
    });
    assetText.setOrigin(0.5, 0.5);
    
    this.load.on('progress', function (value) {
        percentText.setText(parseInt(value * 100) + '%');
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(width/2 - 150, 280, 300 * value, 30);
    });
    
    this.load.on('fileprogress', function (file) {
        assetText.setText('Loading asset: ' + file.key);
    });
    this.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
        assetText.destroy();
    });
    // load images
    this.load.image('background', 'assets/mountain.jpg');
    this.load.image('scoreboard', 'assets/scoreboard.jpg');
    this.load.image('score_btn' , 'assets/score_btn.png');
    let run2 = this.load.image('run2' , 'assets/run/new/2.png');
    let run3 = this.load.image('run3' , 'assets/run/new/3.png');
    let run4 = this.load.image('run5' , 'assets/run/new/5.png');
    this.load.spritesheet('flag' , 'assets/Flag.png' , {frameWidth : 60 , frameHeight : 60});
    this.load.spritesheet('green_flag' , 'assets/Flag1.png' , {frameWidth : 60 , frameHeight : 60});
    this.load.spritesheet('heart' , 'assets/HeartIcon.png' , {frameWidth : 32 , frameHeight : 32});
    this.load.image('play_bt1' , 'assets/button/play/start_btn.png');
    this.load.image('play_bt2' , 'assets/button/play/restart_btn.png');

    this.load.image('count1' , 'assets/countdown/1.png');
    this.load.image('count2' , 'assets/countdown/2.png');
    this.load.image('count3' , 'assets/countdown/3.png');

    this.load.image('clock1' , 'assets/clock/4.png');
    this.load.image('clock2' , 'assets/clock/3.png');
    this.load.image('clock3' , 'assets/clock/2.png');
    this.load.image('clock4' , 'assets/clock/1.png');
    this.load.image('clock5' , 'assets/clock/0.png');


    this.load.image('house' , 'assets/YellowTent.png');

    this.load.image('correct' , 'assets/correct.png');
    this.load.image('incorrect' , 'assets/incorrect.png');

    this.load.image('ice' , 'assets/ice.jpeg');
  
    user = localStorage.getItem('username');
    this.socket = io();
    this.socket.on('score' , function(score , x , y){
      bestScore = score;   
      flagX = x;
      flagY = y;
    })
    this.socket.emit('score' ,user);

  };
  // executed once, after assets were loaded
gameScene.create = function() {
    // create socket
    self = this;
    self.socket.emit('score' , user);

    // background
    let bg = this.add.sprite(0, 0, 'background');
    bg.setOrigin(0,0);
    bg.setScale(1920 / 3000 , 1080 / 2000);

    this.add.sprite(150,860 , 'house').setScale(0.07);
    this.add.sprite(100,890 , 'house').setScale(0.08);
    this.add.sprite(180,900 , 'house').setScale(0.09);

    console.log(bestScore);
    console.log(flagX , flagY);
    this.score = this.add.text(100 , 100 , "Played Time: 0").setStyle({fontSize : '30px' ,fontFamily: 'pixelArt'}).setColor(0xffffff);
    this.playNote = this.add.text(100 , 150 , "Played Note: 0/" + limitCounts).setStyle({fontSize : '20px' ,fontFamily: 'pixelArt'}).setColor(0xffffff);
    this.bestScore = this.add.text(100 , 200 , "Best Time: " + bestScore).setStyle({fontSize : '20px' ,fontFamily: 'pixelArt'}).setColor(0xffffff);
    this.score_btn = this.add.image(40 , 100 , 'score_btn').setOrigin(0 , 0).setScale(0.3);
    this.score_btn.setInteractive({useHandCursor : true}).on('pointerdown' , scoreButtonDown);
    this.score_btn.setInteractive({useHandCursor : true}).on('pointerup' , scoreButtonUp);
    //make path
    let firstx = 240 , firsty = 893;
    let y = firsty - (dis[0] - firstx) /20;
    let tempY;
    let disY = 10;
    this.add.line(0, 0  , firstx ,firsty + disY , dis[0] , y + disY, 0xffffff).setOrigin(0,0);

    for(let j = firstx ; j <= dis[0] ; j +=4)
        this.add.sprite(j , firsty - (j-firstx)/20 + disY , 'ice').setScale(0.25)
    for(let i = 0 ; i < dis.length - 1 ; i ++){
      if(i % 2 == 0)
      {
        tempY = y - (dis[i]  - dis[i+1])/20;

        for(let j = dis[i+1] ; j <= dis[i] ; j +=4)
        this.add.sprite(j , tempY + (j-dis[i+1])/20 + disY , 'ice').setScale(0.25)
      }
      else{
        tempY = y - (dis[i+1] - dis[i])/20;
        for(let j = dis[i] ; j <= dis[i+1] ; j +=4)
        this.add.sprite(j , y - (j-dis[i])/20 + disY , 'ice').setScale(0.25)
      }
      if(dis[i] > dis[i+1] )
        this.add.line(0 , 0, dis[i] ,y + disY,dis[i+1] , tempY + disY, 0xffffff).setOrigin(0,0);
      else
        this.add.line(0, 0 ,dis[i] ,y + disY, dis[i+1] ,tempY + disY, 0xffffff).setOrigin(0,0);



      y = tempY;
    }


    this.player = this.add.sprite(firstx + 5 , firsty - 18 , 'run2');
    this.player.setScale(1);
    console.log(this.player.x , this.player.y)
    clock = this.add.sprite(this.scale.width-300 , 100 , 'clock1');
    clock.setScale(0.2);
    this.anims.create({
       key: 'run',
       frames: [
        {key: 'run2'},
        {key: 'run3'},
        {key: 'run5'},
        {key: 'run3'},
       ],
        frameRate : 15,
        repeat: -1, 
    });
    
    this.anims.create({
      key: 'countdown',
      frames: [
        {key: 'count3'},
        {key: 'count2'},
        {key: 'count1'}
      ],
      delay: 100,
      frameRate: 1,
      hideOnComplete: true,
      repeat : 0,
    });

    this.anims.create({
      key: 'clock',
      frames: [
        {key: 'clock1'},
        {key: 'clock2'},
        {key: 'clock3'},
        {key: 'clock4'},
        {key: 'clock5'},
      ],
      frameRate: 1,
      hideOnComplete: false,
      repeat : -1,
    });


    this.anims.create({
      key: 'flag',
      frames: this.anims.generateFrameNumbers('flag' , {frames:[0,1,2,3,4]}),
      frmaeRate: 6,
      repeat: -1
    })
    this.anims.create({
      key: 'green_flag',
      frames: this.anims.generateFrameNumbers('green_flag' , {frames:[0,1,2,3,4]}),
      frmaeRate: 6,
      repeat: -1
    })
    this.flag = this.add.sprite(flagX , flagY , 'green_flag');
    this.flag.anims.play('green_flag');
    this.flag.flipX = true;

    this.flag1 = this.add.sprite(971 , 320 , 'flag');
    this.flag1.anims.play('flag');
    this.flag1.flipX = true;


    this.heart[0] = this.add.sprite(this.scale.width-100 , 100 , 'heart' ); this.heart[0].setFrame(0).setScale(1.6);
    this.heart[1] = this.add.sprite(this.scale.width-100 - 50 , 100 , 'heart' ); this.heart[1].setFrame(0).setScale(1.6);
    this.heart[2] = this.add.sprite(this.scale.width-100 - 100, 100 , 'heart' ); this.heart[2].setFrame(0).setScale(1.6);

    noteText = this.add.text(this.scale.width/2 - 150, this.scale.height/2 - 150)        
    .setStyle({fontSize: '350px', fontFamily : 'pixelArt'}).setOrigin(0 , 0).setScale(0.7 , 1);

    resultText = this.add.sprite(this.scale.width/2 , this.scale.height/2 - 250,'correct').setScale(0.5);
    resultText.setVisible(false);

    timeText = this.add.text(this.scale.width/2 -130, 150 , '5 sec').setStyle({fontSize:"50px" , fontFamily :"pixelArt"});
    timeText.setVisible(false);

    this.playerHigh = 0;
    button_play= this.add.sprite(this.scale.width /2 , this.scale.height/2 , 'play_bt1');
    button_play.setInteractive({useHandCursor : true}).on('pointerdown' , playButtonDown);
    button_play.setInteractive({useHandCursor : true}).on('pointerup' , playButtonUp);
    button_play.setScale(1.5);

    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);



}

function scoreButtonDown () {
  self.socket.emit('score' , user);
}

function scoreButtonUp () {

}
playButtonDown = () => {
  play_clicked = true;
  initStatus();
  timeText.setVisible(false);
  button_play.setScale(1.5);
  button_play.setTexture('play_bt1');
  processNotes = generateRandomNotes();
  console.log(processNotes)
  // let firstx = 240 , firsty = 893;
  // self.player.x = firstx;
  // self.player.y = firsty;
  // self.playerHigh = 0;
}

function generateRandomNotes() {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const shuffledNotes = shuffleArray([...notes, ...notes ,'C#']);

  // Ensure each note appears twice, with at most one note repeated three times
  for (let i = 0; i < shuffledNotes.length - 1; i++) {
    if (shuffledNotes[i] === shuffledNotes[i + 1]) {
      // Swap the repeated note with the next non-repeated note
      const temp = shuffledNotes[i + 1];
      shuffledNotes[i + 1] = shuffledNotes[i + 2];
      shuffledNotes[i + 2] = temp;
    }
  }

  return shuffledNotes.slice(0, 25);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function initStatus(){
  note_i = 0;
  heartCount = 3;
  totalNote = 0;
  totalScore = 0;
  self.playNote.setText("Played Note: 0/" + limitCounts);
}
function stopGame() {
  flagX = playerX - 30;
  flagY = playerY;
  gameActive = false;
  voiceActive = false;
  moveActive = false;
  button_play.anims.stop("countdown");
  button_play.setTexture('play_bt2');
  button_play.setScale(3.45 , 4.5);
  button_play.setVisible(true);
  self.player.anims.stop('run')
  noteText.setText("");
  clock.anims.stop('clock');
  totalTime = gameEndTime - gameStartTime
  if(note_i == limitCounts)
    self.socket.emit('addScore' , user , totalScore , flagX , flagY);
  self.socket.emit('score' , user);
  self.bestScore.setText('Best Time: ' + bestScore);
  self.player.x = 245;
  self.player.y = 875;
  timeText.setText("Game Over");
  timeText.setVisible(true);
}
var options = {
  source: getSource(),
  voice_stop: function() {
    voiceActive = false; 
    
    
    //console.log("voice stop"); 

    if(resultNotes.length > 0 && gameActive){
      isDead = false;
      var today = new Date();
      endSeconds = (Number)(today.getMinutes()* 60 * 1000 + today.getSeconds() * 1000 + today.getMilliseconds());    
      //resultText.setText(findMostFrequentElement(resultNotes));

      console.log(endSeconds , startSeconds);

      playedTime = (endSeconds - startSeconds)/ 1000;
      let temp = Math.floor((playedTime - 1 )* 1000);
      playedTime = temp/1000;
      timeText.setText(playedTime + " Sec");
      timeText.setVisible(true);
      moveActive = true;
      if(playedTime >= 5){
        resultText.setTexture('incorrect');
        resultText.setVisible(true);
        playDead();
      }
      else if(findMostFrequentElement(resultNotes) == processNotes[note_i])
      {
        resultText.setTexture('incorrect');
        resultText.setVisible(true);
        playDead();
      }else{
        resultText.setTexture('correct');
        resultText.setVisible(true);

        forwardDis = playedTime;
        totalScore += forwardDis;
      }

      prepareNextMove();
      }
    //  }
  }, 
  voice_start: function() {
    voiceActive = true; 
    //console.log("voice start"); 
  }
};
function prepareNextMove(){

  setTimeout(function(){
    resultText.setVisible(false);
    timeText.setVisible(false);
    moveActive = false;
  }, 1200);
  preparing = true;
  note_i ++;
  totalNote ++;
  self.playNote.setText("Played Note: " + totalNote + "/" + limitCounts);
  console.log(note_i)
  if(note_i == limitCounts || heartCount == 0) {
    setTimeout(function(){stopGame()} , 1200);
    stop();
    //stopGame();
  }
  else{
    if(gameActive){
    noteDisplay = false;
    button_play.setTexture('count3');
    button_play.setVisible(true);
    clock.anims.stop('clock' , false);
    button_play.anims.play('countdown' , true).once('animationcomplete' , function(){
      preparing = false;
      console.log(self.player.x , self.player.y)
      noteDisplay = true;
      resultNotes = [];
      //console.log(startSeconds , endSeconds)
      //if(findMostFrequentElement(resultNotes) == 'C' || findMostFrequentElement(resultNotes) == 'C#'){
      setTimeout(function(){
        clock.setTexture('clock1');
        clock.anims.play('clock' , true);
      } , 200)

      var today = new Date();
      startSeconds = (Number)(today.getMinutes()* 60 * 1000 + today.getSeconds() * 1000 + today.getMilliseconds());      
      temp_processnote = processNotes[note_i]
      if(temp_processnote.length == 2 && note_i % 2 ==0)
      {
        if(temp_processnote == 'C#') temp_processnote = 'Db';
        if(temp_processnote == 'D#') temp_processnote = 'Eb';
        if(temp_processnote == 'F#') temp_processnote = 'Gb';
        if(temp_processnote == 'G#') temp_processnote = 'Ab';
        if(temp_processnote == 'A#') temp_processnote = 'Bb';
      }
      console.log(note_i , temp_processnote)
    });
  }}
}
var vad = new VAD(options);
playButtonUp = () => {
  play_clicked = false;
//  button_play.setVisible(false);
  button_play.anims.play('countdown', true);
  temp_processnote = processNotes[0];
  note_i = 0;
  if(temp_processnote.length == 2 && note_i % 2 ==0)
  {
    if(temp_processnote == 'C#') temp_processnote = 'Db';
    if(temp_processnote == 'D#') temp_processnote = 'Eb';
    if(temp_processnote == 'F#') temp_processnote = 'Gb';
    if(temp_processnote == 'G#') temp_processnote = 'Ab';
    if(temp_processnote == 'A#') temp_processnote = 'Bb';
  }
  setTimeout(function(){
    gameActive = true;
    start();
    preparing = false;
    subscribe(DisplayNote) 
    gameActive = true;
    moveActive = false;
    // If you sing into your microphone, your pitch will be logged to the console in real time.
    var today = new Date();
    gameStartTime = today.getHours() * 3600 + today.getMinutes() * 60 + today.getSeconds();      
    startSeconds = (Number)(today.getMinutes()* 60 * 1000 + today.getSeconds() * 1000 + today.getMilliseconds());
    clock.anims.play('clock' , true);
    } , 3000);
}

function playDead(){
    isDead = true;
    self.cameras.main.shake(100);
    forwardDis = 5;
    totalScore += 2;
    playedTime = 0;
    heartCount--;
    prepareNextMove();
}
let dpressed = false;
gameScene.update = function() {

  
     if(gameActive){
      var today = new Date();
      gameEndTime = today.getHours() * 3600 + today.getMinutes() * 60 + today.getSeconds(); 
      noteText.setText(temp_processnote);
      if(!noteDisplay) noteText.setText("");
      if(moveActive && !isDead){
          this.player.anims.play('run' , true);
        // this.player.setVelocityX(this.playerSpeed * 10);
          if(!(this.playerHigh == dis.length && this.player.x >= dis[this.playerHigh - 1])){
            this.player.x += this.playerSpeed * this.playerDirect * (5-forwardDis) * (5-forwardDis) * 1.2;
            this.player.y -= this.playerSpeed * (5-forwardDis) * (5-forwardDis) * 1.2 / 20;
            if(!this.player.flipX && this.player.x >= dis[this.playerHigh]){
              this.playerDirect *= -1;
              this.playerHigh++;
              this.player.flipX = true;
            }else if(this.player.flipX && this.player.x <= dis[this.playerHigh]){
              this.playerDirect *= -1;
              this.playerHigh++;
              this.player.flipX = false;          
            }
        }
      }else{
          this.player.anims.play('run' , false);
      }

      var today = new Date();
      endSeconds = (Number)(today.getMinutes()* 60 * 1000 + today.getSeconds() * 1000 + today.getMilliseconds());    
      //resultText.setText(findMostFrequentElement(resultNotes));

      if(!preparing){
        playedTime = (endSeconds - startSeconds)/ 1000;
        let temp = Math.floor((playedTime - 1 )* 1000);
        playedTime = temp/1000;
        // timeText.setText(playedTime + " Sec");
        // timeText.setVisible(true);
        if(playedTime >= 5){
          console.log(playedTime)
          resultText.setTexture('incorrect');
          resultText.setVisible(true);
          playDead();
        }
      }
    }
    this.flag.x = flagX;
    this.flag.y = flagY;
    this.bestScore.setText("Best Time: " + bestScore);
    this.score.setText("Played Time : " + totalScore);
    playerX = this.player.x;
    playerY = this.player.y;
    for(let i = 0 ; i < heartCount ; i ++){
      this.heart[i].setFrame(0);
    }
    for(let i = heartCount  ; i < 3 ; i ++){
      this.heart[i].setFrame(1);
    }
    if(heartCount == 0 || totalNote >= limitCounts ){
      playerX = this.player.x;
      playerY = this.player.y;
    }
}

const DisplayNote = (noteData) => {

    if(voiceActive && noteData.frequency>=62 && noteData.dB > -50)
    {
      resultNotes.push(noteData.note);
    }
}

function findMostFrequentElement(arr) {
  // Create an object to store the count of each element
  let elementCount = {};

  // Loop through the array and count the occurrences of each element
  arr.forEach(element => {
      if (elementCount[element] === undefined) {
          elementCount[element] = 1;
      } else {
          elementCount[element]++;
      }
  });

  // Find the element with the maximum count
  let maxCount = 0;
  let mostFrequentElement;

  for (let element in elementCount) {
      if (elementCount[element] > maxCount) {
          maxCount = elementCount[element];
          mostFrequentElement = element;
      }
  }

  return mostFrequentElement;
}
