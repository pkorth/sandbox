'use strict';


/* Constructor for Spawner class */
function Spawner(game, x, y, angle) {
	// Inherit from Phaser.Sprite
	Phaser.Sprite.call(this, game, x, y, 'spawner');

	// Mid-handle and resize the sprite
	this.anchor.setTo(0.5, 0.5);
	this.scale.setTo(0.5,0.5);
	
	// Timer to spawn Particles
	this.timer = game.time.create(false);
	this.timer.loop(Spawner.timer_ms, this.shoot, this);
	this.timer.start();

	// Physics properties
	this.shoot_vx = this.shoot_vy = 0;

	// Event callbacks
	this.events.onKilled.add(this.callback_onKilled, this);
	this.events.onRevived.add(this.callback_onRevived, this);

	this.reposition(x, y, angle);
}


/* Spawner class physics propeties */
Spawner.power = 5;
Spawner.spread = 0.1;
Spawner.timer_ms = 200;


/* Inherit prototype from Phaser.Sprite */
Spawner.prototype = Object.create(Phaser.Sprite.prototype);
Spawner.prototype.constructor = Spawner;


/* Called every game tick */
Spawner.prototype.update = function() {
	// Nothing to do (yet)
};


/* Position a Spawner somewhere and update internal state */
Spawner.prototype.reposition = function(x, y, rotation) {
	this.x = x;
	this.y = y;

	// Precompute physics properties
	this.shoot_vx = Math.cos(rotation) * Spawner.power;
	this.shoot_vy = Math.sin(rotation) * Spawner.power;

	// Update sprite
	this.rotation = rotation;
};


/* Spawn and launch a Particle from the Spawner */
Spawner.prototype.shoot = function() {
	var p = Particle.create(this.game, this.x, this.y);
	p.vx = this.shoot_vx * game.rnd.realInRange(1 - Spawner.spread, 1 + Spawner.spread);
	p.vy = this.shoot_vy * game.rnd.realInRange(1 - Spawner.spread, 1 + Spawner.spread);
	this.game.particles.add(p);
}


/* Callback when a Spawner is killed (erased). Stop shooting Particles */
Spawner.prototype.callback_onKilled = function() {
	this.timer.stop();
}


/* Callback when a Spawner is revived (from create()). Resume shooting Partiles */
Spawner.prototype.callback_onRevived = function() {
	this.timer.loop(Spawner.timer_ms, this.shoot, this);
	this.timer.start();
}


/* Returns a new or recycled Spawner instance */
Spawner.create = function(game, x, y, rotation) {
	var s = game.spawners.getFirstExists(false);
	if(s) {
		s.revive();
		s.reposition(x, y, rotation);
	} else {
		s = new Spawner(game, x, y, rotation);
	}
	return s;
}
