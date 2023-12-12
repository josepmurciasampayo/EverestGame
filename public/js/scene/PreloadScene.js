export default class Preload extends Phaser.Scene {

    handlerScene = null
    sceneStopped = false

    constructor() {
        super({ key: 'preload' })
    }

    preload() {
        // Images
        this.width = this.game.screenBaseSize.width
        this.height = this.game.screenBaseSize.height

        this.handlerScene = this.scene.get('handler')
        this.handlerScene.sceneRunning = 'preload'
        this.sceneStopped = false

        this.load.image('background', 'assets/mountain.jpg');
        let run0 = this.load.image('run0' , 'assets/run/new/0.png');
        let run1 = this.load.image('run1' , 'assets/run/new/1.png');
        let run2 = this.load.image('run2' , 'assets/run/new/2.png');
        let run3 = this.load.image('run3' , 'assets/run/new/3.png');
        let run4 = this.load.image('run4' , 'assets/run/new/4.png');

        
    }

    create() {
        const { width, height } = this
        // CONFIG SCENE         
        this.handlerScene.updateResize(this)
        // CONFIG SCENE  

        // GAME OBJECTS  
        let bg = this.add.sprite(0 , 0, 'background');
        // change origin to the top-left of the sprite
        bg.setOrigin(0,0);
        bg.setScale(0.7 , 0.5);
    
        this.player = this.add.sprite(width/2 , height/2 , 'run2');
        this.anims.create({
           key: 'run',
           frames: [
            {key: 'run2'},
            {key: 'run3'},
           ],
            frameRate : 10,
            repeat: -1. 
        });
    
        this.player.flipX = true;
        this.player.setScale(0.3);
        
        // GAME OBJECTS
    }
}