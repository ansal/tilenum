//  Tile Sum Game mail file
//  Author: github.com/ansal

// global variable for holding game data
var TileSum = TileSum || {};

(function(){
  'use strict';

  var NUM_TILE_X = 8;
  var NUM_TILE_Y = 2;

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

  };

  // create objects on screen
  G.prototype.create = function() {

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
    var xReq = 1 + this.game.width  / 50;
    var y = this.game.height - 70;
    for(var i = 1, x = 0; i <= xReq; i += 1, x += 50) {
      this.game.add.sprite(x, y, 'bush');
    }

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

    // time remaining info
    this.timeRemaining = 180;
    this.timeRemainingText = this.game.add.text(
      this.game.width - 130, 
      300,
      this.timeRemaining, {
      font: "60px Helvetica",
      fill: "green",
      align: "right"
    });

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

  // reset puzzle number and selected tiles
  function newPuzzleNum() {
    var remTileSum = sumOfTiles.apply(this);
    var random = this.stage.game.rnd.integerInRange(10, 20);
    // help user to clear remaining tiles if there are less number of tiles
    if(random > remTileSum) {
      random = this.numTilesPool.getFirstAlive().tileNum;
    }
    this.puzzleNum = random;
    this.puzzleNumText.setText(random);
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
    // check whether the tile is already rotated or not
    if(tile.rotation !== 0) {
      return;
    }
    tile.rotation += -90;
    this.tappedTiles.push(tile);
    for(var i = 0, sum = 0; i < this.tappedTiles.length; i += 1) {
      sum += this.tappedTiles[i].tileNum;
    }

    // if sum equals numbers in the tiles kill all the tiles
    // and draw new number
    // if all the tiles are finished, advance to next level
    // make it easy for user if there are a few tiles too
    if(sum === this.puzzleNum) {
      this.tappedTiles.forEach(function(x){
        x.kill();
      });
      newPuzzleNum.apply(this);
    }

    // if sum of user selected tiles are greater than puzzle num,
    // its game over
    if(sum > this.puzzleNum) {
      
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
    this.timeRemaining -= 1;
    this.timeRemainingText.setText(this.timeRemaining);
  }

  // sum of remaining tiles
  function sumOfTiles() {
    var sum = 0;
    this.numTilesPool.forEachAlive(function(x){
      sum += x.tileNum;
    });
    return sum;
  }

})();