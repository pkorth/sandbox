'use strict';


/* Phaser gamestates */
var game_states = {};
game_states.main = function() {};


/* Gamestate: main */
game_states.main.prototype = {
	preload: function() {
		// Load images
		this.game.load.image('particle', 'assets/img/particle.png');
		this.game.load.image('platform', 'assets/img/platform.png');
		this.game.load.image('spawner', 'assets/img/spawner.png');
		this.game.load.spritesheet('button', 'assets/img/buttons.png', 48, 48);
	},

	create: function() {
		// Light-grey background, GUI buttons in top-left corner
		this.game.stage.backgroundColor = '#D4D4D4';
		this.create_gui();

		// Game tools
		this.Tool_e = {
			PLATFORM : 0,
			SPAWNER : 1,
			MAGNET : 2,
			ERASER : 3
		};
		this.current_tool = this.Tool_e.PLATFORM;

		// Click-and-drag info
		this.is_dragging = false;
		this.drag_x = this.drag_y = 0;

		// Handle click events
		this.game.input.onDown.add(this.touch_start, this);
		this.game.input.onUp.add(this.touch_end, this);

		// Game object groups
		this.game.platforms = this.game.add.group();
		this.game.particles = this.game.add.group();
		this.game.spawners = this.game.add.group();
	},

	update: function() {
		// Nothing to do (yet)
	},

	create_gui: function() {
		// Shadow beneath currently-active GUI buttom
		this.tool_shadow = this.game.add.sprite(0, 0, 'button', 4);
		this.tool_shadow.scale.setTo(0.5, 0.5);

		// Create a GUI button with callback for each tool; scale 50%
		this.game.add.button(0, 0, 'button', this.button_platform, this, 0, 0, 0).scale.setTo(0.5, 0.5);
		this.game.add.button(30, 0, 'button', this.button_spawner, this, 1, 1, 1).scale.setTo(0.5, 0.5);
		this.game.add.button(60, 0, 'button', this.button_magnet, this, 2, 2, 2).scale.setTo(0.5, 0.5);
		this.game.add.button(90, 0, 'button', this.button_eraser, this, 3, 3, 3).scale.setTo(0.5, 0.5);
	},

	touch_start: function(pointer) {
		// Avoid stealing button clicks (hack-ish)
		if(pointer.x < 114 && pointer.y < 24) {
			return;
		}

		switch(this.current_tool) {
			case this.Tool_e.PLATFORM:
			case this.Tool_e.SPAWNER:
				this.drag_x = pointer.x;
				this.drag_y = pointer.y;
				this.is_dragging = true;
				break;
			case this.Tool_e.MAGNET:
				break;
			case this.Tool_e.ERASER:
				this.erase_at(pointer.x, pointer.y);
				break;
		}
	},

	touch_end: function(pointer) {
		// Avoid stealing button clicks (hack-ish)
		if(!this.is_dragging) {
			return;
		}

		switch(this.current_tool) {
			case this.Tool_e.PLATFORM:
				this.game.platforms.add(Platform.create(this.game,
						this.drag_x, this.drag_y, pointer.x, pointer.y));
				break;
			case this.Tool_e.SPAWNER:
				var rotation = Math.atan2(pointer.y - this.drag_y,
						pointer.x - this.drag_x);
				this.game.spawners.add(Spawner.create(this.game,
						this.drag_x, this.drag_y, rotation));
				break;
			case this.Tool_e.MAGNET:
			case this.Tool_e.ERASER:
				// Nothing to do
				break;
		}
		this.is_dragging = false;
	},

	erase_at: function(x, y) {
		// Cap the max distance away to erase an object at
		var closest_obj = null;
		var closest_dist = 30;

		// Check platforms (segment, left point, right point)
		this.game.platforms.forEachExists(function(p) {
			var dist = point_to_segment(x, y, p.x0, p.y0, p.x1, p.y1);
			if(dist < closest_dist) {
				closest_dist = dist;
				closest_obj = p;
			}
		}, this);

		// Check spawners
		this.game.spawners.forEachExists(function(s) {
			var dist = point_to_point(x, y, s.x, s.y);
			if(dist < closest_dist) {
				closest_dist = dist;
				closest_obj = s;
			}
		}, this);

		// Do we have a nearby object to erase?
		if(closest_obj !== null) {
			closest_obj.kill();
		}
	},

	button_platform: function() {
		this.set_tool(this.Tool_e.PLATFORM);
	},

	button_spawner: function() {
		this.set_tool(this.Tool_e.SPAWNER);
	},

	button_magnet: function() {
		this.set_tool(this.Tool_e.MAGNET);
	},

	button_eraser: function() {
		this.set_tool(this.Tool_e.ERASER);
	},

	set_tool: function(tool) {
		this.current_tool = tool;
		// Tween button shadow sprite to correct position
		this.game.add.tween(this.tool_shadow).to({x: 0 + tool * 30}, 500,
				Phaser.Easing.Exponential.Out, true);
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


/*
Determine distance from a point to a line segment
*/
function point_to_segment(ax, ay, bx0, by0, bx1, by1) {
	var length_sqr = point_to_point_sqr(bx0, by0, bx1, by1);
	var perc = ((ax-bx0) * (bx1-bx0) + (ay-by0) * (by1-by0)) / length_sqr;
	if(perc < 0) {
		return point_to_point(ax, ay, bx0, by0);
	} else if(perc > 1) {
		return point_to_point(ax, ay, bx1, by1);
	} else {
		var tx, ty;
		tx = bx0 + perc * (bx1-bx0);
		ty = by0 + perc * (by1-by0);
		return point_to_point(ax, ay, tx, ty);
	}
}


/*
Determine distance from a point to a point
*/
function point_to_point(ax, ay, bx, by) {
	return Math.sqrt(point_to_point_sqr(ax, ay, bx, by));
}


/*
Determine distance from a point to a point, squared (helper function)
*/
function point_to_point_sqr(ax, ay, bx, by) {
	var dist_x, dist_y;

	dist_x = ax - bx;
	dist_y = ay - by;
	return dist_x*dist_x + dist_y*dist_y;
}


/* Initialize Phaser framework and start game */
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');
game.state.add('main', game_states.main);
game.state.start('main');
