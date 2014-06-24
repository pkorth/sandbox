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
		this.game.load.image('magnet', 'assets/img/magnet.png');
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
		this.game.magnets = this.game.add.group();
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
				this.game.magnets.add(Magnet.create(this.game, pointer.x, pointer.y));
				break;
			case this.Tool_e.ERASER:
				this.erase_at(pointer);
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

	// Expects point {x, y}
	erase_at: function(pos) {
		// Cap the max distance away to erase an object at
		var closest_obj = null;
		var closest_dist = 30;

		// Check platforms (segment, left point, right point)
		this.game.platforms.forEachExists(function(p) {
			var dist = point_to_segment(pos, p);
			if(dist < closest_dist) {
				closest_dist = dist;
				closest_obj = p;
			}
		}, this);

		// Check spawners
		this.game.spawners.forEachExists(function(s) {
			var dist = point_to_point(pos, s);
			if(dist < closest_dist) {
				closest_dist = dist;
				closest_obj = s;
			}
		}, this);

		// Check magnets
		this.game.magnets.forEachExists(function(m) {
			var dist = point_to_point(pos, m);
			if(dist < closest_dist) {
				closest_dist = dist;
				closest_obj = m;
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


/* Initialize Phaser framework and start game */
var game_size = {x: window.innerWidth, y:window.innerHeight};
var game = new Phaser.Game(game_size.x, game_size.y, Phaser.AUTO, 'gameDiv');
game.state.add('main', game_states.main);
game.state.start('main');
