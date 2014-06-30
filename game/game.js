//  Tile Sum Game mail file
//  Author: github.com/ansal

// global variable for holding game data
var TileSum = TileSum || {};

(function(){
  'use strict';

  // game constructor
  TileSum.Game = function(game){};

  // shortcut
  var G = TileSum.Game;

  // load assets
  G.prototype.preload = function() {
    
    for(var i = 1; i <= 9; i += 1) {
      this.game.load.image('numTile' + i, 'assets/img/num' + i + '.png');
    }

  };

  // create objects on screen
  G.prototype.create = function() {

    this.game.stage.backgroundColor = 0x337799;

    this.numTilesPool = this.game.add.group();

    // invoke utility function to draw tiles
    drawNumTiles.apply(this, [8, 8]);

    // initialize puzzle num
    // 0 for puzzle number means new number should be displayed
    this.puzzleNum = 0;
    this.puzzleNumText = this.game.add.text(
      this.game.width - 150, 
      30,
      "*", {
      font: "100px Helvetica",
      fill: "white",
      align: "right"
    });

    // initialize array to hold user tapped tiles
    this.tappedTiles = [];

    this.game.add.text(
      this.game.width - 150, 
      10,
      "tap tiles to sum", {
      font: "18px Helvetica",
      fill: "white",
      align: "right"
    });

  };

  // game engine update call
  G.prototype.update = function() {
    
    // check whether we need a new num
    // puzzle num equals 0 means we need a new number
    if(this.puzzleNum === 0) {
      var random = this.stage.game.rnd.integerInRange(10, 20);
      this.puzzleNum = random;
      this.puzzleNumText.setText(random);
      this.tappedTiles = [];
    }

  };

  // utility functions

  // draw an 8 x 8 coloumn of random number tiles
  function drawNumTiles(numX, numY) {
    for( var i = 1, x, y = 45, random; i <= numY; i += 1) {
      x = 50;
      for(var j = 1; j <= numX; j += 1) {
        random = this.stage.game.rnd.integerInRange(1, 9);
        var tile = this.game.add.sprite(x, y, 'numTile' + random);
        tile.anchor.setTo(0.5, 0.5);
        tile.tileNum = random;
        tile.inputEnabled = true;
        tile.events.onInputDown.add(userTouchedTile, this);
        this.numTilesPool.add(tile);
        x += 77;
      }
      y += 77;;
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
    console.log(sum, this.tappedTiles)
    if(sum === this.puzzleNum) {
      this.puzzleNum = 0;
      this.tappedTiles.forEach(function(x){
        x.kill();
      });
    }
  }

})();