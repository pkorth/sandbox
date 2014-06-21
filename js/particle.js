'use strict';


/* Constructor for Particle class */
function Particle(game, x, y) {
	// Inherit from Phaser.Sprite
	Phaser.Sprite.call(this, game, x, y, 'particle');

	// Mid-handle and resize the sprite
	this.anchor.setTo(0.5, 0.5);
	this.scale.setTo(0.25,0.25);

	// Physics properties
	this.vx = this.vy = 0;

	this.reposition(x, y, 0, 0);
}


/* Particle class physics propeties */
Particle.gravity = 0.08;
Particle.air_resistance = 0.005;
Particle.elastic = 0.8;


/* Inherit prototype from Phaser.Sprite */
Particle.prototype = Object.create(Phaser.Sprite.prototype);
Particle.prototype.constructor = Particle;


/* Called every game tick */
Particle.prototype.update = function() {
	// Gravity
	this.vy += Particle.gravity;

	// Air resistance
	this.vx *= (1 - Particle.air_resistance);
	this.vy *= (1 - Particle.air_resistance);

	// Collide with Platform?
	var movement = {x0: this.x, y0: this.y, x1: this.x + this.vx, y1: this.y + this.vy};
	this.game.platforms.forEachExists(function(p) {
		var point = segments_intersect(movement, p);
		if(point !== null) {
			// Calculate resultant velocity
			var vx_tmp = p.cos*this.vx + p.sin*this.vy;
			var vy_tmp = p.cos*this.vy - p.sin*this.vx;
			vy_tmp *= -Particle.elastic;
			this.vx = p.cos*vx_tmp - p.sin*vy_tmp;
			this.vy = p.cos*vy_tmp + p.sin*vx_tmp;
			// Complete the movement to the platform
			this.x = point.x;
			this.y = point.y;
			// Hack to make falling through cracks more rare
			this.y -= 1;
		}
	}, this);

	// Attracted to magnet? "Arcade" physics
	this.game.magnets.forEachExists(function(m) {
		// Distance
		var dx = this.x - m.x;
		var dy = this.y - m.y;
		var dist = point_to_point(this, m);
		// Gravity
		var dist_mult = 1 - (dist / Magnet.force_dist);
		if(dist_mult < 0) {
			return;
		}
		// Effect
		var angle = Math.atan2(dy, dx) + Math.PI;
		this.vx += Math.cos(angle) * Magnet.force_mult * dist_mult;
		this.vy += Math.sin(angle) * Magnet.force_mult * dist_mult;
	}, this);

	// Update position
	this.x += this.vx;
	this.y += this.vy;

	// Exit bottom of playing field?
	if(this.y > this.game.world.height * 1.5) {
		this.destroy();
	}
};


/* Position a Particle somewhere and update internal state */
Particle.prototype.reposition = function(x, y, vx, vy) {
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vx = vx;
};


/* Returns a new or recycled Particle instance */
Particle.create = function(game, x, y) {
	var p = game.particles.getFirstExists(false);
	if(p) {
		p.revive();
		p.reposition(x, y, 0, 0);
	} else {
		p = new Particle(game, x, y);
	}
	return p;
}
