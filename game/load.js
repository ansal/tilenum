// global variable for holding game data
var TileSum = TileSum || {};

(function(){
  'use strict';
  
  var game = new Phaser.Game(800, 630, Phaser.CANVAS, 'game');
  game.state.add('Play', TileSum.Game, false);

  game.state.start('Play');

})();