'use strict';


/* Constructor for Platform class */
function Platform(game, x0, y0, x1, y1) {
	// Inherit from Phaser.Sprite
	Phaser.Sprite.call(this, game, x0, y0, 'platform');

	// Rotate sprite around its center left end
	this.anchor.setTo(0, 0.5);

	// Physics properties
	this.x0 = this.y0 = 0;
	this.x1 = this.y1 = 0;
	this.cos = this.sin = 0;

	this.reposition(x0, y0, x1, y1);
}


/* Inherit prototype from Phaser.Sprite */
Platform.prototype = Object.create(Phaser.Sprite.prototype);
Platform.prototype.constructor = Platform;


/* Called every game tick */
Platform.prototype.update = function() {
	// Nothing to do (yet)
};


/* Position a Platform somewhere and update internal state */
Platform.prototype.reposition = function(x0, y0, x1, y1) {
	this.x0 = x0;
	this.y0 = y0;
	this.x1 = x1;
	this.y1 = y1;
	
	// Precompute physics properties
	var rotation = Math.atan2(y1 - y0, x1 - x0);
	var length = Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0));
	this.cos = Math.cos(rotation);
	this.sin = Math.sin(rotation);

	// Update sprite
	this.rotation = rotation;
	this.scale.setTo(length / 100, 1);
};
