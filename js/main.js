'use strict';


/* Phaser gamestates */
var game_states = {};
game_states.main = function() {};


/* Gamestate: main */
game_states.main.prototype = {
	preload: function() {
		// Load images
		this.game.load.image('background', 'assets/img/background.png');
		this.game.load.image('particle', 'assets/img/particle.png');
		this.game.load.image('platform', 'assets/img/platform.png');
	},

	create: function() {
		this.game.add.sprite(0, 0, 'background');

		this.game.platforms = this.game.add.group();
		this.game.particles = this.game.add.group();

		this.game.platforms.add(Platform.create(this.game, 300, 300, 400, 500));
		this.game.platforms.add(Platform.create(this.game, 400, 500, 600, 400));
		this.game.particles.add(Particle.create(this.game, 300, 100));
	},

	update: function() {
		// Nothing to do (yet)
	}
};


/*
Determine if line segments a0-a1 and b0-b1 intersect. If so, return the point of
intersection. Else, return null.
*/
function segments_intersect(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1) {
	var segAx, segAy, segBx, segBy;
	var s, t;

	// Segment lengths
	segAx = ax1 - ax0;
	segAy = ay1 - ay0;
	segBx = bx1 - bx0;
	segBy = by1 - by0;

	// Magic
	s = (-segAy * (ax0 - bx0) + segAx * (ay0 - by0)) / (-segBx * segAy + segAx * segBy);
	t = ( segBx * (ay0 - by0) - segBy * (ax0 - bx0)) / (-segBx * segAy + segAx * segBy);

	if(s >= 0 && s <= 1 && t >= 0 && t <= 1) {
		// Collision; return point of intersection
		return {x: ax0 + (t * segAx), y: ay0 + (t * segAy)};
	} else {
		// No collision; return null
		return null;
	}
}


/* Initialize Phaser framework and start game */
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');
game.state.add('main', game_states.main);
game.state.start('main');
