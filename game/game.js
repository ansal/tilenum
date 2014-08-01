//  Tile Sum Game main file
//  Author: github.com/ansal

// global variable for holding game data
var TileSum = TileSum || {};

(function(){
  'use strict';

  // number of tiles
  var NUM_TILE_X = 8;
  var NUM_TILE_Y = 7;

  // number of tiles to sum for random numbers
  var RAND_NUM_TILES = 3;

  // counter start
  var COUNTER_START = 400;

  // intro screen

  // constructor for level failed screen
  TileSum.Intro = function(game){};
  // shortcut
  var I = TileSum.Intro;
  I.prototype.preload = function() {
    // background
    this.game.load.image('bg', 'assets/img/bg.png');
    // blank tile
    this.game.load.image('blankTile', 'assets/img/blankTile.png');
    // bush
    this.game.load.image('bush', 'assets/img/bush.png');
  }; 
  I.prototype.create = function() {

    // draw background
    drawBackground.apply(this);
    // draw bush
    drawBush.apply(this);

    this.githubText = this.game.add.text(
      this.game.width - 350, 
      10,
      "github.com/ansal/tilesum", {
      font: "30px Helvetica",
      fill: "green",
      align: "white"
    });

    this.titleText = this.game.add.text(
      10, 
      180,
      "TILESUM", {
      font: "180px Helvetica",
      fill: "green",
      align: "right"
    });

    this.startButton = this.game.add.sprite(320, 400, 'blankTile');
    this.buttonText = this.game.add.text(
      335, 
      410,
      "Start!", {
      font: "50px Helvetica",
      fill: "white",
      align: "right"
    });

    // add touch/click event fot continue button and text
    this.startButton.inputEnabled = true;
    this.startButton.events.onInputDown.add(userTouchedContinue, this);
    this.buttonText.inputEnabled = true;
    this.buttonText.events.onInputDown.add(userTouchedContinue, this);

  };

  // constructor for level failed screen
  TileSum.LevelFailed = function(game){};
  // shortcut
  var LF = TileSum.LevelFailed;
  LF.prototype.preload = function() {
    // background
    this.game.load.image('bg', 'assets/img/bg.png');
    // blank tile
    this.game.load.image('blankTile', 'assets/img/blankTile.png');
    // bush
    this.game.load.image('bush', 'assets/img/bush.png');
  }; 
  LF.prototype.create = function() {

    // draw background
    drawBackground.apply(this);
    // draw bush
    drawBush.apply(this);

    this.levelFailedText = this.game.add.text(
      20, 
      200,
      "Oh! Oh! Thats Wrong! Tap Continue to try again!", {
      font: "35px Helvetica",
      fill: "green",
      align: "right"
    });

    this.continueButton = this.game.add.sprite(320, 250, 'blankTile');
    this.buttonText = this.game.add.text(
      330, 
      270,
      "Continue", {
      font: "32px Helvetica",
      fill: "white",
      align: "right"
    });

    // add touch/click event fot continue button and text
    this.continueButton.inputEnabled = true;
    this.continueButton.events.onInputDown.add(userTouchedContinue, this);
    this.buttonText.inputEnabled = true;
    this.buttonText.events.onInputDown.add(userTouchedContinue, this);

  };

  // game constructor
  TileSum.Game = function(game){};

  // shortcut
  var G = TileSum.Game;

  // load assets
  G.prototype.preload = function() {
    
    // background
    this.game.load.image('bg', 'assets/img/bg.png');

    // clouds
    this.game.load.image('cloud1', 'assets/img/cloud1.png');
    this.game.load.image('cloud2', 'assets/img/cloud2.png');
    this.game.load.image('cloud3', 'assets/img/cloud3.png');

    // bush
    this.game.load.image('bush', 'assets/img/bush.png');

    // num tiles
    for(var i = 1; i <= 9; i += 1) {
      this.game.load.image('numTile' + i, 'assets/img/num' + i + '.png');
    }

    // sounds
    this.game.load.audio('correctSound', 'assets/sounds/correct.ogg');
    this.game.load.audio('wrongSound', 'assets/sounds/wrong.ogg');
    this.game.load.audio('tileRollSound', 'assets/sounds/tileRoll.ogg');

  };

  // create objects on screen
  G.prototype.create = function() {

    // game state
    this.gameOver = false;

    // draw background
    drawBackground.apply(this);

    // draw clouds
    this.cloudPool = this.game.add.group();
    for(var i = 1; i <= 10; i += 1) {
      for(var j = 1; j <= 3; j += 1) {
        var random = this.stage.game.rnd.integerInRange(1, this.game.height);
        var cloud = this.game.add.sprite(0, random, 'cloud' + j);
        this.cloudPool.add(cloud);
        cloud.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(cloud, Phaser.Physics.ARCADE);
        cloud.checkWorldBounds = true;
        cloud.outOfBoundsKill = true;
        cloud.kill();
      }
    }
    // invoke drawCloud to draw one cloud
    drawCloud.apply(this);
    // timer for drawing clouds
    this.game.time.events.loop(
      Phaser.Timer.SECOND * 5,
      drawCloud,
      this
    );

    // draw bush
    drawBush.apply(this);
    

    this.numTilesPool = this.game.add.group();
    // invoke utility function to draw tiles
    drawNumTiles.apply(this, [NUM_TILE_X, NUM_TILE_Y]);

    // initialize puzzle num
    // 0 for puzzle number means new number should be displayed
    this.puzzleNumText = this.game.add.text(
      this.game.width - 150, 
      30,
      "*", {
      font: "100px Helvetica",
      fill: "green",
      align: "right"
    });
    newPuzzleNum.apply(this);

    this.game.add.text(
      this.game.width - 150, 
      10,
      "tap tiles to sum", {
      font: "18px Helvetica",
      fill: "green",
      align: "right"
    });

    // level info
    var level = getLevel();
    this.timeRemainingText = this.game.add.text(
      this.game.width - 140, 
      270,
      "Level " + level, {
      font: "25px Helvetica",
      fill: "green",
      align: "right"
    });

    // time remaining info
    // time remaining is start time - (level -1 * 10)
    this.timeRemaining = COUNTER_START - ( (level - 1) * 10 );
    this.timeRemainingText = this.game.add.text(
      this.game.width - 150, 
      300,
      this.timeRemaining, {
      font: "60px Helvetica",
      fill: "green",
      align: "right"
    });

    // sounds
    this.soundCorrect = this.game.add.audio('correctSound');
    this.soundWrong = this.game.add.audio('wrongSound');
    this.soundTileRolled = this.game.add.audio('tileRollSound');

    // timer to update game
    this.game.time.events.loop(
      Phaser.Timer.SECOND,
      updateGameTime,
      this
    );

  };

  // game engine update call
  G.prototype.update = function() {
    
  };

  // utility functions  

  function drawBackground() {
    // draw background
    var xReq = 1 + this.game.width / 256;
    var yReq = 1 + this.game.width / 256;
    for(var i = 1, x, y = 0; i <= yReq; i += 1) {
      x = 0;
      for (var j = 1; j <= xReq; j += 1) {
        this.game.add.sprite(x, y, 'bg');
        x += 256;
      }
      y += 256;
    }
  }

  // draw bush
  function drawBush () {
    var xReq = 1 + this.game.width  / 50;
    var y = this.game.height - 70;
    for(var i = 1, x = 0; i <= xReq; i += 1, x += 50) {
      this.game.add.sprite(x, y, 'bush');
    }
  }

  // reset puzzle number and selected tiles
  function newPuzzleNum() {

    // check for game over state
    if(this.gameOver) {
      return;
    }

    // shortcut for random function
    var randInt = this.stage.game.rnd.integerInRange;
    window.x = this.numTilesPool;
    var aliveTiles = this.numTilesPool.countLiving();

    var puzzleNum = 0;
    for(var i = 1; i <= RAND_NUM_TILES && i <= aliveTiles; i += 1) {
      var randomTile = this.numTilesPool.getRandom();
      if(randomTile.alive) {
        puzzleNum += randomTile.tileNum;
      }
    }
    if(puzzleNum === 0) {
      puzzleNum = this.numTilesPool.getFirstAlive().tileNum;
    }

    this.puzzleNum = puzzleNum;
    this.puzzleNumText.setText(puzzleNum);
    this.tappedTiles = [];
  }

  // draw an 8 x 8 coloumn of random number tiles
  function drawNumTiles(numX, numY) {
    for( var i = 1, x, y = 45, random; i <= numY; i += 1) {
      x = 50;
      for(var j = 1; j <= numX; j += 1) {
        random = this.stage.game.rnd.integerInRange(1, 9);
        var tile = this.game.add.sprite(x, y, 'numTile' + random);
        tile.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(tile, Phaser.Physics.ARCADE);
        tile.checkWorldBounds = true;
        tile.outOfBoundsKill = true;
        tile.tileNum = random;
        tile.inputEnabled = true;
        tile.events.onInputDown.add(userTouchedTile, this);
        this.numTilesPool.add(tile);
        x += 77;
      }
      y += 77;
    }
  }

  // event handler for user touching/clicking a tile
  function userTouchedTile (tile, event) {

    this.soundTileRolled.play();

    // check for game over state
    if(this.gameOver) {
      return;
    }

    // check whether the tile is already rotated or not
    if(tile.rotation !== 0) {
      return;
    }
    tile.rotation += -90;
    this.tappedTiles.push(tile);
    for(var i = 0, sum = 0; i < this.tappedTiles.length; i += 1) {
      sum += this.tappedTiles[i].tileNum;
    }

    // if sum of user selected tiles are greater than puzzle num,
    // its game over
    if(sum > this.puzzleNum) {
      this.soundWrong.play();
      this.gameOver = true;
      TileSum.game.state.start('LevelFailed');
      return;
    }

    // if sum equals numbers in the tiles kill all the tiles
    // and draw new number
    // if all the tiles are finished, advance to next level
    if(sum === this.puzzleNum) {
      this.soundCorrect.play();
      this.tappedTiles.forEach(function(x){
        x.kill();
      });

      if(this.numTilesPool.countLiving() === 0) {
        this.gameOver = true;
        // update the game level and reload the game play
        incrLevel();
        TileSum.game.state.start('Play');
        return;
      }

      newPuzzleNum.apply(this);
    }

  }

  // draws a cloud
  function drawCloud() {
    var cloud = this.cloudPool.getFirstDead();
    if(cloud === null || cloud === undefined) {
      return;
    }
    cloud.revive();
    var random = this.stage.game.rnd.integerInRange(1, this.game.height);
    cloud.reset(0, random);
    cloud.body.velocity.x = 30;
  }

  // updates game clock
  function updateGameTime() {

    // check for game over state
    if(this.gameOver) {
      return;
    }

    this.timeRemaining -= 1;
    this.timeRemainingText.setText(this.timeRemaining);
  }

  // level saver
  // checks for level value in localstorage
  function getLevel() {
    var level = localStorage.getItem('level');
    if(!level) {
      level = 1;
      localStorage.setItem('level', level);
    } else {
      level = parseInt(level, 10);
    }
    return level;
  }

  // increments the level to one
  function incrLevel() {
    var level = localStorage.getItem('level');
    if(!level) {
      level = 1;
      localStorage.setItem('level', level);
      return level;
    } else {
      level = parseInt(level, 10);
      level += 1;
      localStorage.setItem('level', level);
      return level;
    }
  }

  // continue the gameplay when user fails a level
  function userTouchedContinue() {
    TileSum.game.state.start('Play');
  }

})();