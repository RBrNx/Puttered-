/**
 * Created by Conor on 14/04/2015.
 */
var level2 = function(game){};

//TODO Clean up this code
level2.prototype = {
    preload: function(){
        this.game.load.spritesheet("ButtonSq", "Graphics/Buttons/Button-Square.png", 150, 150);
        this.game.load.spritesheet("Shot", "Graphics/Player/Swing.png", 400, 400);
        this.game.load.image("Ball", "Graphics/Player/Ball.png");
        this.game.load.physics("Physics", "Graphics/Level_Assets/Grass_Land/Physics.json");
        this.game.load.image("Fairway", "Graphics/Level_Assets/Grass_Land/Level2/Level2.png");
        this.game.load.image("FairwayHole", "Graphics/Level_Assets/Grass_Land/Level2/Level2-Hole.png");
        //this.game.load.image("Flag", "Graphics/Player/Flag.png");
        this.game.load.image("SwingButton", "Graphics/Buttons/Swing-Button.png");
        this.game.load.image("PowerBar", "Graphics/Buttons/Power-Bar.png");
        this.game.load.image("PowerFill", "Graphics/Buttons/Gradient.png");
        this.game.load.image("Arrow", "Graphics/Player/Arrow.png");
        this.game.load.image("Star", "Graphics/Level_Assets/star.png");
        this.game.load.image("Block", "Graphics/Player/Block.png");
        this.game.load.image("BackgroundP", "Graphics/Background/Background-Pause.png");
        this.game.load.image("Scoreboard", "Graphics/Background/Scoreboard.png");
        this.game.load.audio("GolfClap", "Music/GolfClap.ogg");
        this.game.load.audio("GolfSwing", "Music/GolfSwing.ogg");

        this.game.world.setBounds(0, -500, 3000, 1580);
    },

    create: function() {
        Started = "false";
        Power = 0;
        LevelComplete = false;
        BallStationary = true;
        CameraCenterX = 0;
        CameraCenterY = 0;
        Timer = 0;
        ScoreboardShown = false;
        StrokeCount = 0;
        SavedBallVelX = 0;
        SavedBallVelY = 0;
        HoleNumber = 1;
        FinishSwing = false;
        Paused = false;
        ballMaterial = null;
        groundMaterial = null;
        contactMaterial = null;
        Radian = 0.0174532925;


        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 1400;

        Clouds = this.game.add.tileSprite(0,-500, 3000, 2160, "Clouds");
        Hills = this.game.add.sprite(0,0,"Hills");
        Hills.scale.setTo(2,1);
        FairwayHole = this.game.add.sprite(this.game.world.centerX, 543, "FairwayHole");
        this.game.physics.p2.enable(FairwayHole);
        FairwayHole.body.kinematic = true;
        FairwayHole.body.clearShapes();
        FairwayHole.body.loadPolygon("Physics", "Level2-Hole");

        Ball = this.game.add.sprite(40, 170, "Ball");
        Ball.anchor.setTo(0.5, 0.5);
        this.game.physics.p2.enable(Ball);
        Ball.body.clearShapes();
        Ball.body.loadPolygon("Physics", "Ball");

        Player = this.game.add.sprite(50, 290, "Shot");
        Player.animations.add("Swing");
        Player.scale.setTo(0.5, 0.5);
        Player.anchor.setTo(0.5, 0.5);

        Block = this.game.add.sprite(2553, 860, "Block");
        this.game.physics.p2.enable(Block);
        Block.body.static = true;

        Fairway = this.game.add.sprite(this.game.world.centerX, 543, "Fairway");
        Fairway.anchor.setTo(0.5,0.5);

        ballMaterial = this.game.physics.p2.createMaterial("ballMaterial", Ball.body);
        groundMaterial = this.game.physics.p2.createMaterial("groundMaterial", FairwayHole.body);
        this.game.physics.p2.setWorldMaterial(groundMaterial, true, true, true, true);
        contactMaterial = this.game.physics.p2.createContactMaterial(ballMaterial, groundMaterial);

        contactMaterial.friction = 0.5;
        contactMaterial.restitution = 0.5;

        MusicControl = this.game.add.audio("Course2Music", 1, true);
        if (Music == true) MusicControl.play();
        //TODO Add game Sounds

        Emitter = this.game.add.emitter(Block.x, Block.y);
        Emitter.makeParticles("Star");
        Emitter.minParticleSpeed.setTo(-100, -300);
        Emitter.maxParticleSpeed.setTo(100, -1000);
        Emitter.minParticleScale = 0.1;
        Emitter.maxParticleScale = 0.1;
        Emitter.setAlpha(0.1, 0.6);
        Emitter.gravity = 250;
        //TODO Change emitter colour

        //Set up GUI - Arrow, Left + Right Buttons, Swing Button, Pause Button, Power Bar
        Arrow = this.game.add.sprite(Ball.x, Ball.y, "Arrow");
        Arrow.anchor.setTo(0.5, 1);
        Arrow.scale.setTo(0.1, 0.1);
        Arrow.rotation = 181 * Radian;
        Arrow.angle = 60;

        LeftB = this.game.add.sprite(20, 920, "Button");
        LeftBText = this.game.add.bitmapText(LeftB.x + 160, LeftB.y + 15, "8Bit", "<", 100);
        LeftBText.fixedToCamera = true;
        LeftB.fixedToCamera = true;
        LeftB.inputEnabled = true;

        RightB = this.game.add.sprite(470, 920, "Button");
        RightBText = this.game.add.bitmapText(RightB.x + 180, RightB.y + 15, "8Bit", ">", 100);
        RightBText.fixedToCamera = true;
        RightB.fixedToCamera = true;
        RightB.inputEnabled = true;

        this.PowerB = this.game.add.sprite(1400, 830, "PowerBar");
        this.PowerF = this.game.add.sprite(1649, 1080, "PowerFill");
        this.PowerF.anchor.setTo(0.5, 1);
        this.PowerB.fixedToCamera = true;
        this.PowerF.fixedToCamera = true;
        this.PowerF.rotation = 181 * Radian;
        this.PowerF.visible = false;
        this.PowerB.visible = false;

        PauseB = this.game.add.button(1720, 50, "ButtonSq", this.Pause, this, 0, 0, 1, 0);
        PauseBText = this.game.add.bitmapText(PauseB.x + 30, PauseB.y + 15, "8Bit", "II", 100);
        PauseB.fixedToCamera = true;
        PauseBText.fixedToCamera = true;

        SwingB = this.game.add.button(1400, 830, "SwingButton", this.Swing, this, 0, 0, 0, 0);
        SwingB.fixedToCamera = true;

    },

    update: function(){
        Clouds.tilePosition.x += 1;
        CameraCenterX = this.game.camera.x + this.game.camera.width/2;
        CameraCenterY = this.game.camera.y + this.game.camera.height/2;

        if (FairwayHole != undefined && Fairway != undefined) {

            if (this.game.input.activePointer.isDown && Paused != true && LevelComplete != true) {
                if (LeftB.input.checkPointerOver(this.game.input.activePointer) != true && RightB.input.checkPointerOver(this.game.input.activePointer) != true && SwingB.input.checkPointerOver(this.game.input.activePointer) != true) {
                    if (this.game.origDragPoint) {
                        // move the camera by the amount the mouse has moved since last update
                        this.game.camera.x += this.game.origDragPoint.x - this.game.input.activePointer.x;
                        this.game.camera.y += this.game.origDragPoint.y - this.game.input.activePointer.y;
                    }
                }
                // set new drag origin to current position
                this.game.origDragPoint = this.game.input.activePointer.position.clone();
            }
            else {
                this.game.origDragPoint = null;
            }
        }

        if (this.game.input.activePointer.isDown && Paused != true && Scoreboard != undefined) {
            if (Scoreboard.input.checkPointerOver(this.game.input.activePointer)){
                this.game.state.start("GameState");
                //console.log("Level2");
            }
        }

        if (this.PowerF != undefined && Paused != true) {
            if (this.PowerF.angle <= -179) {
                this.Ticker = 1;

            }
            if (this.PowerF.angle >= 0){
                this.Ticker = -1;

            }
            if (this.PowerF.visible == true) {
                this.PowerF.angle += this.Ticker;
                Power += this.Ticker;
            }
        }

        if (Arrow != undefined  && Paused != true){
            if (Arrow.visible == true && this.game.input.activePointer.isDown && LeftB.input.checkPointerOver(this.game.input.activePointer)){
                Arrow.angle -= 1;
            }
            if (Arrow.visible == true && this.game.input.activePointer.isDown && RightB.input.checkPointerOver(this.game.input.activePointer)){
                Arrow.angle += 1;
            }
        }


        if (Ball.body.velocity.x < 0.002 && Ball.body.velocity.y < 0.002 && Ball.body.velocity.x > -0.002 && Ball.body.velocity.y > -0.002){
            BallStationary = true;
            if (LevelComplete != true) Arrow.visible = true;
            Arrow.position.setTo(Ball.x, Ball.y);
            if (LevelComplete != true) Player.position.setTo(Ball.x - 25, Ball.y - 90);
            if (LevelComplete != true) FinishSwing = false;
        }
        else if (Ball.body.velocity.x >= 0.002 || Ball.body.velocity.y >= 0.002 || Ball.body.velocity.x <= -0.002 || Ball.body.velocity.y <= -0.002 ){
            BallStationary = false;
            Arrow.visible = false;
        }

        if (LevelComplete == true && Timer < 300 && ScoreboardShown == false){
            Timer += 1;
        }
        if (Timer == 300){
            this.ShowScoreboard();
        }

        if (Player.animations.currentAnim.frame == 12 && FinishSwing == false){
            this.FinishSwing();
        }

        Player.events.onAnimationComplete.add(function() {
            Player.animations.stop("Swing", true);
        }, this);

        if (Arrow.angle >= 0 && Arrow.angle <= 180){
            Player.scale.x = 0.5;
        }
        else{
            Player.scale.x = -0.5;
        }

        Block.body.onBeginContact.add(this.LevelComplete, this);

    },
    render: function(){
        this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
        //if (Ball != undefined) this.game.debug.spriteInfo(Ball, 32, 32);
        this.game.debug.inputInfo(32, 32);
    },

    Swing: function() {
        if (Started == "false" && BallStationary == true && LevelComplete != true && Paused != true) {
            this.PowerB.visible = true;
            this.PowerF.visible = true;
            Power = 0;
            Started = "true";
        }
        else if (Started == "true"){
            Player.animations.play("Swing", 20, false);
            this.game.camera.follow(Ball, Phaser.Camera.FOLLOW_TOPDOWN);
            this.PowerF.visible = false;
            this.PowerB.visible = false;
            Started = "false";

        }
    },

    FinishSwing: function() {
        var VelocityX = (Power * Math.cos((Arrow.angle -90) * Radian) * 10);
        var VelocityY = (Power * Math.sin((Arrow.angle -90) * Radian) * 10);
        Ball.body.velocity.x += VelocityX;
        Ball.body.velocity.y += VelocityY;

        Power = 0;
        this.PowerF.angle = -179;
        StrokeCount += 1;
        FinishSwing = true;
        if(Sound == true)GolfSwing.play();
    },

    Pause: function(){
        if (!Paused && LevelComplete != true) {
            Paused = true;
            this.TurnOffCollisions();

            BackgroundP = this.game.add.sprite(this.game.camera.x, this.game.camera.y, "BackgroundP");

            if (Music == true) MusicOn = this.game.add.button(this.game.camera.x - 200, CameraCenterY - 175, "MusicOn", this.TurnMusicOff, this, 0, 0, 1, 0);
            if (Sound == true) SoundOn = this.game.add.button(this.game.camera.x - 200, CameraCenterY + 25, "SoundOn", this.TurnSoundOff, this, 0, 0, 1, 0);
            if (Music == false) MusicOff = this.game.add.button(this.game.camera.x - 200, CameraCenterY - 175, "MusicOff", this.TurnMusicOn, this, 0, 0, 1, 0);
            if (Sound == false) SoundOff = this.game.add.button(this.game.camera.x - 200, CameraCenterY + 25, "SoundOff", this.TurnSoundOn, this, 0, 0, 1, 0);

            Resume = this.game.add.button(CameraCenterX, this.game.camera.y - 1700, "Button", this.ResumeGame, this, 0, 0, 1, 0);
            Resume.anchor.setTo(0.5, 0.5);
            ResumeText = this.game.add.bitmapText(Resume.x, Resume.y - 10, "8Bit", "Resume", 56);
            ResumeText.anchor.setTo(0.5, 0.5);

            Restart = this.game.add.button(CameraCenterX, this.game.camera.y - 1500, "Button", this.RestartCourse, this, 0, 0, 1, 0);
            Restart.anchor.setTo(0.5, 0.5);
            RestartText = this.game.add.bitmapText(Restart.x, Restart.y - 10, "8Bit", "Restart\n Course", 50);
            RestartText.anchor.setTo(0.5, 0.5);

            Fullscreen = this.game.add.button(CameraCenterX, this.game.camera.y - 1300, "Button", this.Fullscreen, this, 0 ,0 ,1, 0);
            Fullscreen.anchor.setTo(0.5, 0.5);
            FullscreenText = this.game.add.bitmapText(Fullscreen.x, Fullscreen.y - 10, "8Bit", "Fullscreen", 36);
            FullscreenText.anchor.setTo(0.5, 0.5);

            Menu = this.game.add.button(CameraCenterX, this.game.camera.y - 1100, "Button", this.MainMenu, this, 0, 0, 1, 0);
            Menu.anchor.setTo(0.5, 0.5);
            MenuText = this.game.add.bitmapText(Menu.x, Menu.y - 10, "8Bit", "Menu", 72);
            MenuText.anchor.setTo(0.5, 0.5);

            this.game.add.tween(Resume).to({y: CameraCenterY - 300}, 200, Phaser.Easing.Linear.NONE, true);
            this.game.add.tween(ResumeText).to({y: CameraCenterY - 305}, 200, Phaser.Easing.Linear.NONE, true);
            this.game.add.tween(Restart).to({y: CameraCenterY - 100}, 200, Phaser.Easing.Linear.NONE, true);
            this.game.add.tween(RestartText).to({y: CameraCenterY - 105}, 200, Phaser.Easing.Linear.NONE, true);
            this.game.add.tween(Fullscreen).to({y: CameraCenterY + 100}, 200, Phaser.Easing.Linear.NONE, true);
            this.game.add.tween(FullscreenText).to({y: CameraCenterY + 95}, 200, Phaser.Easing.Linear.NONE, true);
            this.game.add.tween(Menu).to({y: CameraCenterY + 300}, 200, Phaser.Easing.Linear.NONE, true);
            this.game.add.tween(MenuText).to({y: CameraCenterY + 295}, 200, Phaser.Easing.Linear.NONE, true);
            if (Music == true) this.game.add.tween(MusicOn).to({x: (CameraCenterX) - 400}, 200, Phaser.Easing.Linear.NONE, true);
            if (Sound == true) this.game.add.tween(SoundOn).to({x: (CameraCenterX) - 400}, 200, Phaser.Easing.Linear.NONE, true);
            if (Music == false) this.game.add.tween(MusicOff).to({x: (CameraCenterX) - 400}, 200, Phaser.Easing.Linear.NONE, true);
            if (Sound == false)this.game.add.tween(SoundOff).to({x: (CameraCenterX) - 400}, 200, Phaser.Easing.Linear.NONE, true);

        }
    },

    ResumeGame: function(){
        Paused = false;
        this.TurnOnCollisions();
        BackgroundP.destroy();

        this.game.add.tween(Resume).to({y: -1700}, 200, Phaser.Easing.Linear.NONE, true);
        this.game.add.tween(ResumeText).to({y: -1700}, 200, Phaser.Easing.Linear.NONE, true);
        this.game.add.tween(Restart).to({y: -1500}, 200, Phaser.Easing.Linear.NONE, true);
        this.game.add.tween(RestartText).to({y: -1500}, 200, Phaser.Easing.Linear.NONE, true);
        this.game.add.tween(Fullscreen).to({y: -1300}, 200, Phaser.Easing.Linear.NONE, true);
        this.game.add.tween(FullscreenText).to({y: -1300}, 200, Phaser.Easing.Linear.NONE, true);
        this.game.add.tween(Menu).to({y: -1100}, 200, Phaser.Easing.Linear.NONE, true);
        this.game.add.tween(MenuText).to({y: -1100}, 200, Phaser.Easing.Linear.NONE, true);
        if(Music == true)this.game.add.tween(MusicOn).to({x: -200}, 200, Phaser.Easing.Linear.NONE, true);
        if(Sound == true)this.game.add.tween(SoundOn).to({x: -200}, 200, Phaser.Easing.Linear.NONE, true);
        if(Music == false)this.game.add.tween(MusicOff).to({x: -200}, 200, Phaser.Easing.Linear.NONE, true);
        if(Sound == false) this.game.add.tween(SoundOff).to({x: -200}, 200, Phaser.Easing.Linear.NONE, true);

    },

    LevelComplete: function(){
        if (LevelComplete != true){
            Emitter.flow(2000, 250, 5, 50);
            LevelComplete = true;
            Arrow.visible = false;
            //this.TurnOffCollisions();
            StrokeArray[HoleNumber] = StrokeCount;
            if(Sound == true)GolfClap.play();
        }
    },

    ShowScoreboard: function(){
        Timer = 0;
        ScoreboardShown = true;
        BackgroundP = this.game.add.sprite(this.game.camera.x, this.game.camera.y, "BackgroundP");
        Scoreboard = this.game.add.sprite(CameraCenterX, this.game.camera.y - 500, "Scoreboard");
        Scoreboard.inputEnabled = true;
        Scoreboard.anchor.setTo(0.5, 0.5);
        var CourseTitle = this.game.add.bitmapText(Scoreboard.x, Scoreboard.y - 385, "8Bit", "Grass Land", 72);
        CourseTitle.anchor.setTo(0.5);

        var Hole = this.game.add.bitmapText(Scoreboard.x - 290, Scoreboard.y + 15, "8Bit", "Hole\n\n\n   1\n\n   2\n\n   3\n\n   4\n\n " +
        "  5\n\n   6\n\n   7\n\n   8\n\n   9");
        var Par = this.game.add.bitmapText (Scoreboard.x - 30, Scoreboard.y + 15, "8Bit", "Par\n\n\n  3\n\n  1\n\n  1\n\n  1\n\n  1\n\n" +
        "  1\n\n  1\n\n  1\n\n  1");
        var Score = this.game.add.bitmapText(Scoreboard.x + 240, Scoreboard.y + 15, "8Bit",
            "Strokes\n\n\n      " + StrokeArray[0] + "\n\n      " + StrokeArray[1] + "\n\n      " + StrokeArray[2] +
            "\n\n      " + StrokeArray[3] + "\n\n      " + StrokeArray[4] + "\n\n      " + StrokeArray[5] + "\n\n      "
            + StrokeArray[6] + "\n\n      " + StrokeArray[7] + "\n\n      " + StrokeArray[8]);

        var Continue = this.game.add.bitmapText(Scoreboard.x, Scoreboard.y + 400, "8Bit", "Tap Here to Continue", 30);
        Hole.anchor.setTo(0.5);
        Par.anchor.setTo(0.5);
        Score.anchor.setTo(0.5);
        Continue.anchor.setTo(0.5);
        Continue.tint = 0x191919;

        this.game.add.tween(Scoreboard).to({y: CameraCenterY}, 200, Phaser.Easing.Linear.NONE, true);
        this.game.add.tween(CourseTitle).to({y: CameraCenterY - 385}, 200, Phaser.Easing.Linear.NONE, true);
        this.game.add.tween(Hole).to({y: CameraCenterY + 15}, 200, Phaser.Easing.Linear.NONE, true);
        this.game.add.tween(Par).to({y: CameraCenterY + 15}, 200, Phaser.Easing.Linear.NONE, true);
        this.game.add.tween(Score).to({y: CameraCenterY + 15}, 200, Phaser.Easing.Linear.NONE, true);
        this.game.add.tween(Continue).to({y: CameraCenterY + 400}, 200, Phaser.Easing.Linear.NONE, true);

    },

    TurnMusicOff: function(){
        MusicOff = this.game.add.button(CameraCenterX - 400, CameraCenterY - 175, "MusicOff", this.TurnMusicOn, this, 0, 0, 1, 0);
        MusicOn.destroy();
        Music = false;
        //Turn Music Off here
        MusicControl.pause();
    },

    TurnMusicOn: function(){
        MusicOn = this.game.add.button(CameraCenterX - 400, CameraCenterY - 175, "MusicOn", this.TurnMusicOff, this, 0, 0, 1, 0);
        MusicOff.destroy();
        Music = true;
        //Turn Music On here
        MusicControl.play();
    },

    TurnSoundOff: function(){
        SoundOff = this.game.add.button(CameraCenterX - 400, CameraCenterY + 25, "SoundOff", this.TurnSoundOn, this, 0, 0, 1, 0);
        SoundOn.destroy();
        Sound = false;
        //Turn Sound Off here
    },

    TurnSoundOn: function() {
        SoundOn = this.game.add.button(CameraCenterX - 400, CameraCenterY + 25, "SoundOn", this.TurnSoundOff, this, 0, 0, 1, 0);
        SoundOff.destroy();
        Sound = true;
        //Turn Sound On here
    },

    MainMenu: function(){
        this.game.state.start("MainMenu");
        MusicControl.stop();
    },

    RestartCourse: function(){
        this.game.state.start("GameState");
        MusicControl.stop();
    },

    Fullscreen: function() {
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.refresh();

        if (this.game.scale.isFullScreen) {
            this.game.scale.stopFullScreen();
        } else {
            this.game.scale.startFullScreen();
        }
    },

    TurnOffCollisions: function() {
        console.log("TurnOffCollisions");
        SavedBallVelX = Ball.body.velocity.x;
        SavedBallVelY = Ball.body.velocity.y;
        Ball.body.velocity.x = 0;
        Ball.body.velocity.y = 0;
        this.game.physics.p2.gravity.y = 0;
        FairwayHole.body.clearCollision();
        Ball.body.clearCollision();
        FairwayHole.body.clearShapes();
        Ball.body.clearShapes();
        Block.body.clearCollision();
        Block.body.clearShapes();

    },

    TurnOnCollisions: function() {
        console.log("TurnOnCollisions");
        this.game.physics.p2.enable(FairwayHole);
        this.game.physics.p2.enable(Ball);
        this.game.physics.p2.enable(Block);
        FairwayHole.body.loadPolygon("Physics", "Level1-Hole");
        FairwayHole.kinematic = true;
        Ball.body.loadPolygon("Physics", "Ball");
        Ball.body.velocity.x = SavedBallVelX;
        Ball.body.velocity.y = SavedBallVelY;
        Block.body.static = true;
        this.game.physics.p2.gravity.y = 1400;

        ballMaterial = this.game.physics.p2.createMaterial("ballMaterial", Ball.body);
        groundMaterial = this.game.physics.p2.createMaterial("groundMaterial", FairwayHole.body);
        this.game.physics.p2.setWorldMaterial(groundMaterial, true, true, true, true);
        contactMaterial = this.game.physics.p2.createContactMaterial(ballMaterial, groundMaterial);
        contactMaterial.friction = 0.5;
        contactMaterial.restitution = 0.5;
    }

};