function Weapon(player) {
	this.player = player;
	this.sprite = player.sprite;
	this.fireRate = 300;
	this.nextFire = 0;
	this.bulletSpeed = 1000;
}

Weapon.prototype = {
	create : function(type) {
	    var w = game.add.group();
	    w.enableBody = true;
	    w.physicsBodyType = Phaser.Physics.ARCADE;
	    w.owner = this.sprite;
		this[type](w);
	    w.setAll('checkWorldBounds', true);
	    w.setAll('outOfBoundsKill', true);
	    return w;

	},
	bullet : function(w) {
	    w.createMultiple(20, 'bullet');
		w.damage = 10;
	    this.fireRate = 300;
		this.bulletSpeed = 1000;
		this.killBulletAfterTime = true;
		this.killBulletTiming = 300;
		this.sound = game.add.audio('laser');
		this.sound.volume = VOLUME;
	},
	missle : function(w) {
	    w.createMultiple(3, 'missle');
	    w.damage = 25;
	    this.fireRate = 300;
		this.bulletSpeed = 1000;
		this.sound = game.add.audio('missle');
		this.sound.volume = VOLUME - 0.1;
	},
	fire : function(pointer) {
	    if(game.time.now > this.nextFire && this.sprite.weapon.countDead() > 0){
	        this.nextFire = game.time.now + this.fireRate;
	        var bullet = this.sprite.weapon.getFirstDead();
	        bullet.reset(this.sprite.x, this.sprite.y);
	        bullet.rotation = game.physics.arcade.angleToXY(bullet, pointer.x, pointer.y);
	        game.physics.arcade.moveToObject(bullet, pointer, this.bulletSpeed);
	        bullet.damage = this.sprite.weapon.damage;
	        if(this.killBulletAfterTime){
		        setTimeout(function() {
		        	bullet.kill();
		        }.bind(this), this.killBulletTiming);
	        }

	        if(!this.sound.isPlaying)
	        	this.sound.play();
	    }
	}
}

