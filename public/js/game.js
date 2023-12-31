// create a new scene named "Game"
import { freelizer } from './freelizer/index.js'
const { start, subscribe ,stop , getSource} = await freelizer()


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
let noteText , resultText;
let game = new Phaser.Game(config);
let limitCounts = 25;
let totalScore = 0;
let dis = [1694 , 323 , 1435 , 554 , 1345 , 606 , 1246 ,696 , 1195 , 743 , 1158 , 782 , 1115 , 819 , 1076 , 883 , 1044 , 905 , 1032 , 924 , 1018 , 971];
let forwardDis = 0;
let noteDisplay = true;


const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
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
let flagX , flagY ,playerX , playerY;

let  keyD , isDead = false;


let self;
let user = "";
let totalNote = 0 , totalTime = 0;
let gameStartTime = 0 , gameEndTime = 0;
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
    this.load.spritesheet('heart' , 'assets/HeartIcon.png' , {frameWidth : 32 , frameHeight : 32});
    this.load.image('play_bt1' , 'assets/button/play/start_btn.png');
    this.load.image('play_bt2' , 'assets/button/play/start_btn.png');

    this.load.image('count1' , 'assets/countdown/1.png');
    this.load.image('count2' , 'assets/countdown/2.png');
    this.load.image('count3' , 'assets/countdown/3.png');

    this.load.image('clock1' , 'assets/clock/0.png');
    this.load.image('clock2' , 'assets/clock/1.png');
    this.load.image('clock3' , 'assets/clock/2.png');
    this.load.image('clock4' , 'assets/clock/3.png');
    this.load.image('clock5' , 'assets/clock/4.png');


    this.load.image('house' , 'assets/YellowTent.png');

    this.load.image('correct' , 'assets/correct.png');
    this.load.image('incorrect' , 'assets/incorrect.png');
  };
  // executed once, after assets were loaded
gameScene.create = function() {
    // create socket
      self = this;
      this.socket = io();
      this.socket.emit('scoreboard');
      this.socket.on('scoreboard' , function(players){
        scores = players;
        user = this.id;
      })
    // background
    let bg = this.add.sprite(0, 0, 'background');
    bg.setOrigin(0,0);
    bg.setScale(1920 / 3000 , 1080 / 2000);


    this.add.sprite(70,890 , 'house').setScale(0.04);
    this.add.sprite(100,880 , 'house').setScale(0.04);
    this.add.sprite(110,900 , 'house').setScale(0.05);

    this.score = this.add.text(100 , 100 , "TotalScore : 0").setStyle({fontSize : '30px' ,fontFamily: 'pixelArt'}).setColor(0xffffff);
    this.playTime = this.add.text(80 , 150 , "Time: 0").setStyle({fontSize : '20px' ,fontFamily: 'pixelArt'}).setColor(0xffffff);
    this.playNote = this.add.text(350 , 150 , "Note: 0").setStyle({fontSize : '20px' ,fontFamily: 'pixelArt'}).setColor(0xffffff);
    this.score_btn = this.add.image(40 , 100 , 'score_btn').setOrigin(0 , 0).setScale(0.3);
    this.score_btn.setInteractive({useHandCursor : true}).on('pointerdown' , scoreButtonDown);
    this.score_btn.setInteractive({useHandCursor : true}).on('pointerup' , scoreButtonUp);
    //make path
    let firstx = 160 , firsty = 897;
    let y = firsty - (dis[0] - firstx) /20;
    let tempY;
    let disY = 10;
    this.add.line(0, 0  , firstx ,firsty + disY , dis[0] , y + disY, 0xffffff).setOrigin(0,0);
    for(let i = 0 ; i < dis.length - 1 ; i ++){
      if(i % 2 == 0)
        tempY = y - (dis[i]  - dis[i+1])/20;
      else
        tempY = y - (dis[i+1] - dis[i])/20;
      if(dis[i] > dis[i+1] )
        this.add.line(0 , 0, dis[i] ,y + disY,dis[i+1] , tempY + disY, 0xffffff).setOrigin(0,0);
      else
        this.add.line(0, 0 ,dis[i] ,y + disY, dis[i+1] ,tempY + disY, 0xffffff).setOrigin(0,0);
      y = tempY;
    }


    this.player = this.add.sprite(firstx , firsty , 'run2');
    this.player.setScale(0.5);

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

    this.flag = this.add.sprite(this.player.x - 35, this.player.y -14 , 'flag');
    this.flag.anims.play('flag');
    this.flag.flipX = true;

    this.flag1 = this.add.sprite(971 , 320 , 'flag');
    this.flag1.anims.play('flag');
    this.flag1.flipX = true;


    flagX = this.flag.x;
    flagY = this.flag.y;

    this.heart[0] = this.add.sprite(this.scale.width-100 , 100 , 'heart' ); this.heart[0].setFrame(0).setScale(1.6);
    this.heart[1] = this.add.sprite(this.scale.width-100 - 50 , 100 , 'heart' ); this.heart[1].setFrame(0).setScale(1.6);
    this.heart[2] = this.add.sprite(this.scale.width-100 - 100, 100 , 'heart' ); this.heart[2].setFrame(0).setScale(1.6);

    noteText = this.add.text(this.scale.width/2 - 110, this.scale.height/2 - 150)        
    .setStyle({fontSize: '400px'}).setOrigin(0 , 0);

    resultText = this.add.sprite(this.scale.width/2 , this.scale.height/2 - 250,'correct').setScale(0.5);
    resultText.setVisible(false);



    this.playerHigh = 0;
    button_play= this.add.sprite(this.scale.width /2 , this.scale.height/2 , 'play_bt1');
    button_play.setInteractive({useHandCursor : true}).on('pointerdown' , playButtonDown);
    button_play.setInteractive({useHandCursor : true}).on('pointerup' , playButtonUp);
    button_play.setScale(1.5);

    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

}

function scoreButtonDown () {
  self.socket.emit('scoreboard');
  console.log(scores);
}

function scoreButtonUp () {

}
playButtonDown = () => {
  play_clicked = true;
  button_play.setTexture('play_bt2');
  heartCount = 3;
  processNotes = generateRandomNotes();
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

function stopGame() {
  flagX = playerX - 35;
  flagY = playerY - 14;
  notesCount = 0;
  button_play.anims.play("countdown" , false);
  button_play.setTexture('play_bt1');
  button_play.setVisible(true);
  noteText.setText("");
  clock.anims.play('clock' , false);
  gameActive = false;
  totalTime = gameEndTime - gameStartTime
  stop();
}
playButtonUp = () => {
  play_clicked = false;
//  button_play.setVisible(false);
  button_play.anims.play('countdown', true);
  setTimeout(function(){
    gameActive = true;
    start();
    var today = new Date();
    gameStartTime = today.getHours() * 3600 + today.getMinutes() * 60 + today.getSeconds();
    
    subscribe(DisplayNote)

      var options = {
        source: getSource(),
        voice_stop: function() {
          voiceActive = false; 
          //console.log("voice stop"); 
          if(resultNotes.length > 0){
            //resultText.setText(findMostFrequentElement(resultNotes));
            console.log(endSeconds - startSeconds)
            console.log(findMostFrequentElement(resultNotes))
            if(findMostFrequentElement(resultNotes) == processNotes[note_i])
            {
              resultText.setTexture('incorrect');
              resultText.setVisible(true);
              isDead = true;
            }else{
              resultText.setTexture('correct');
              resultText.setVisible(true);

              forwardDis = 5 - (endSeconds - startSeconds)
              totalScore += forwardDis;
              self.socket.emit('addScore',self.socket.id , totalScore);
            }
            setTimeout(function(){
              resultText.setVisible(false);
            }, 1200);
            note_i ++;
            totalNote ++;
            self.playNote.setText("Note: " + totalNote);
            if(note_i == limitCounts)  stopGame();
            else{
              noteDisplay = false;
              button_play.setTexture('count3');
              button_play.setVisible(true);
              button_play.anims.play('countdown');
              button_play.on("animationcomplete" , function(){
                noteDisplay = true;
                resultNotes = [];
                gameActive = true;
                //console.log(startSeconds , endSeconds)
                //if(findMostFrequentElement(resultNotes) == 'C' || findMostFrequentElement(resultNotes) == 'C#'){
                moveActive = true;
                setTimeout(function(){
                  moveActive = false;
                  clock.anims.play('clock' , true);
                } , 200)
              });
            }
            }
            var today = new Date();
            startSeconds = today.getHours() * 3600 + today.getMinutes() * 60 + today.getSeconds();
          //  }
        }, 
        voice_start: function() {
          clock.anims.play('clock' , false);
          voiceActive = true; 
          //console.log("voice start"); 
          var today = new Date();
          endSeconds = today.getHours() * 3600 + today.getMinutes() * 60 + today.getSeconds();
        }
      }; 
      var vad = new VAD(options);
      // If you sing into your microphone, your pitch will be logged to the console in real time.
      var today = new Date();
      startSeconds = today.getHours() * 3600 + today.getMinutes() * 60 + today.getSeconds();      

      clock.anims.play('clock' , true);

    } , 3000);
}
let dpressed = false;
gameScene.update = function() {

  
     if(gameActive){
      var today = new Date();
      gameEndTime = today.getHours() * 3600 + today.getMinutes() * 60 + today.getSeconds();     
      this.playTime.setText("Time: " + Math.floor(totalTime + (gameEndTime- gameStartTime)));
      noteText.setText(processNotes[note_i]);
        if(!noteDisplay) noteText.setText("");
      if(moveActive){
          this.player.anims.play('run' , true);
        // this.player.setVelocityX(this.playerSpeed * 10);
          if(!(this.playerHigh == dis.length && this.player.x >= dis[this.playerHigh - 1])){
            this.player.x += this.playerSpeed * this.playerDirect * forwardDis;
            this.player.y -= this.playerSpeed * forwardDis / 20;
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
      playerX = this.player.x;
      playerY = this.player.y;
      this.flag.x = flagX;
      this.flag.y = flagY;
      if(keyD.isDown) dpressed = true;

      if((keyD.isUp && dpressed) || isDead){
        console.log('D key pressed');
        this.cameras.main.shake(100);
        heartCount--;
        dpressed = false;
        isDead = false;
      }
      for(let i = 0 ; i < heartCount ; i ++){
        this.heart[i].setFrame(0);
      }
      for(let i = heartCount  ; i < 3 ; i ++){
        this.heart[i].setFrame(1);
      }
      if(heartCount == 0){
        playerX = this.player.x;
        playerY = this.player.y;
        stopGame();
      }

      this.score.setText("TotalScore : " + totalScore);
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
