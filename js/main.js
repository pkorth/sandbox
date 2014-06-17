'use strict';


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


var gameState = {};
gameState.main = function() {};
gameState.main.prototype = {
	preload: function() {
		// Load images
		this.game.load.image('background', 'assets/img/background.png');
		this.game.load.image('ball', 'assets/img/ball.png');
		this.game.load.image('platform', 'assets/img/platform.png');
	},

	create: function() {
		this.game.add.sprite(0, 0, 'background');

		this.game.platforms = this.game.add.group();
		this.game.balls = this.game.add.group();

		this.add_platform(300, 300, 400, 500);
		this.add_platform(400, 500, 600, 400);
		this.add_ball(300, 100);
	},

	update: function() {
		// Nothing to do (yet)
	},

	add_platform: function(x0, y0, x1, y1) {
		var p = this.game.platforms.create(x0, y0, 'platform');

		// Rotate sprite around its left end
		p.anchor.setTo(0, 0.5);

		// Physics properties
		p.x0 = p.y0 = 0;
		p.x1 = p.y1 = 0;
		p.cos = p.sin = 0;
		
		p.reposition = function(x0, y0, x1, y1) {
			p.x0 = x0;
			p.y0 = y0;
			p.x1 = x1;
			p.y1 = y1;
			
			// Precompute physics properties
			var rotation = Math.atan2(y1 - y0, x1 - x0);
			var length = Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0));
			p.cos = Math.cos(rotation);
			p.sin = Math.sin(rotation);

			// Update sprite
			p.rotation = rotation;
			p.scale.setTo(length / 100, 1);
		};

		p.reposition(x0, y0, x1, y1);
	},

	add_ball: function(x, y) {
		var b = this.game.balls.create(x, y, 'ball');
		b.scale.setTo(0.5,0.5);

		// Physics constants
		b.gravity = 0.35;
		b.air_resistance = 0.005;
		b.elastic = 0.8;

		// Physics properties
		b.vx = b.vy = 0;

		b.update = function() {
			// Gravity
			b.vy += b.gravity;

			// Air resistance
			b.vx *= (1 - b.air_resistance);
			b.vy *= (1 - b.air_resistance);

			// Collide with platform?
			this.game.platforms.forEach(function(p){
				var point = segments_intersect(b.x, b.y, b.x + b.vx, b.y + b.vy,
						p.x0, p.y0, p.x1, p.y1);
				if(point !== null) {
					var vx_tmp = p.cos*b.vx + p.sin*b.vy;
					var vy_tmp = p.cos*b.vy - p.sin*b.vx;
					vy_tmp *= -b.elastic;
					b.x = point.x;
					b.y = point.y;
					b.vx = p.cos*vx_tmp - p.sin*vy_tmp;
					b.vy = p.cos*vy_tmp + p.sin*vx_tmp;
					b.collided = true;
				}
			});

			// Update position
			b.x += b.vx;
			b.y += b.vy;

			// Exit playing field?
			if(b.y > this.game.world.height * 1.5) {
				b.destroy();
			}
		};
	}
};


var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
game.state.add('main', gameState.main);
game.state.start('main');
