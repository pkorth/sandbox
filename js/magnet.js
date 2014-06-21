'use strict';


/* Constructor for Magnet class */
function Magnet(game, x, y) {
	// Inherit from Phaser.Sprite
	Phaser.Sprite.call(this, game, x, y, 'magnet');

	// Mid-handle and resize the sprite
	this.anchor.setTo(0.5, 0.5);
	this.scale.setTo(0.4,0.4);

	// Add an extra sprite for animation purposes
	this.anim_sprite = game.add.sprite(x, y, 'magnet');
	this.anim_sprite.anchor.setTo(0.5, 0.5);
	this.anim_sprite.scale.setTo(0.4,0.4);

	// Timer to animate the sprite
	this.anim_timer = game.time.create(false);
	this.anim_timer.loop(Magnet.anim_ms, this.anim_play, this);
	this.anim_timer.start();

	// Event callbacks
	this.events.onKilled.add(this.callback_onKilled, this);
	this.events.onRevived.add(this.callback_onRevived, this);

	this.reposition(x, y);
}


/* Magent class animation and physics properties */
Magnet.anim_ms = 1500;
Magnet.force_mult = 0.1;
Magnet.force_dist = 250;


/* Inherit prototype from Phaser.Sprite */
Magnet.prototype = Object.create(Phaser.Sprite.prototype);
Magnet.prototype.constructor = Magnet;


/* Called every game tick */
Magnet.prototype.update = function() {
	// TODO
};


/* Position a Magnet somewhere and update internal state */
Magnet.prototype.reposition = function(x, y) {
	this.x = x;
	this.y = y;
	this.anim_sprite.x = x;
	this.anim_sprite.y = y;
};


/* Start the animation */
Magnet.prototype.anim_play = function() {
	// Tween extra sprite to shrink to nothing
	this.anim_sprite.scale.setTo(0.4,0.4);
	this.game.add.tween(this.anim_sprite.scale).to({x: 0.0, y: 0.0}, 500,
			Phaser.Easing.Linear.In, true);
};


/* Callback when a Magnet is killed (erased). Stop the animation timer */
Magnet.prototype.callback_onKilled = function() {
	this.anim_timer.stop();
}


/* Callback when a Magnet is revived (from create()). Resume animation timer */
Magnet.prototype.callback_onRevived = function() {
	this.anim_timer.loop(Magnet.anim_ms, this.anim_play, this);
	this.anim_timer.start();
}


/* Returns a new or recycled Magnet instance */
Magnet.create = function(game, x, y) {
	var m = game.magnets.getFirstExists(false);
	if(m) {
		m.revive();
		m.reposition(x, y);
	} else {
		m = new Magnet(game, x, y);
	}
	return m;
}
