'use strict';


/* Constructor for Particle class */
function Particle(game, x, y) {
	// Inherit from Phaser.Sprite
	Phaser.Sprite.call(this, game, x, y, 'particle');

	// Mid-handle sprite and resize the image
	this.anchor.setTo(0.5, 0.5);
	this.scale.setTo(0.5,0.5);

	this.vx = 0;
	this.vy = 0;
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
	this.game.platforms.forEach(function(p) {
		var point = segments_intersect(this.x, this.y, this.x + this.vx,
				this.y + this.vy, p.x0, p.y0, p.x1, p.y1);
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
			// Hack to (mostly) fix falling through cracks
			if(Math.abs(this.vy) < 0.25) {
				this.y -= Math.abs(this.vy);
			}
		}
	}, this);

	// Update position
	this.x += this.vx;
	this.y += this.vy;

	// Exit bottom of playing field?
	if(this.y > this.game.world.height * 1.5) {
		this.destroy();
	}
};


/* Returns a new or recycled Particle instance */
Particle.create = function(game, x, y) {
	var p = game.particles.getFirstExists(false);
	if(p) {
		p.revive();
		this.vx = 0;
		this.vy = 0;
	} else {
		p = new Particle(game, x, y);
	}
	return p;
}