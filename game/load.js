// global variable for holding game data
var TileSum = TileSum || {};

(function(){
  'use strict';
  
  TileSum.game = new Phaser.Game(800, 630, Phaser.CANVAS, 'game');
  TileSum.game.state.add('Play', TileSum.Game, false);
  TileSum.game.state.add('LevelFailed', TileSum.LevelFailed, false);
  TileSum.game.state.add('Intro', TileSum.Intro, false);

  TileSum.game.state.start('Intro');

})();