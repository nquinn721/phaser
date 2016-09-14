MAP_ELEMENTS.floor = function() {
    
}

MAP_ELEMENTS.floor.prototype = {
	init : function(fl) {
		this.floor = game.add.sprite(fl.x || 0, fl.y || 575, fl.sprite || 'floor');
		console.log(this.floor);
		game.physics.enable(this.floor, Phaser.Physics.ARCADE);
	    this.floor.body.immovable = true;
	    this.floor.width = fl.w || 800;
	    this.floor.height = fl.h || 25;
	    this.floor.cl = this;
	    return this.floor;
	},
	playerHitElement : function(floor, player) {
		// floor.body.velocity.y = 100;
		// console.log('player hit floor', player, floor);
	},
	bulletHitElement : function(floor, bullet) {
		bullet.kill();
	}
}