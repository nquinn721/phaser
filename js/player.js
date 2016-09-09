function Player(playerObj, game) {
	this.x = playerObj.x;
	this.y = playerObj.y;
	this.id = playerObj.id;
	this.username = playerObj.username;
	this.sprite = game.add.sprite(this.x, this.y, 'player');
    game.physics.enable( this.sprite, Phaser.Physics.ARCADE);
    console.log(this.username);

    

	this.fireRate = 200;
	this.nextFire = 0;
}

Player.prototype = {
	init : function() {
	    this.animations();
	    this.sprite.anchor.setTo(.5,.5);
	    this.sprite.body.collideWorldBounds = true;
	    this.sprite.body.gravity.y = 1000;
	    this.sprite.weapon = this.createWeapon(this.sprite);
	    this.sprite.id = this.id;
	    this.sprite.health = 100;
	    this.createHPBar(52, 12, null, null, '#ffffff');
	    this.sprite.hpbar = this.createHPBar(40, 10, -26, -44);
	    this.createName();
	    return this.sprite;
	},
	move : function(dir) {
        if(dir === 'left'){
            this.sprite.scale.x = -1;
            this.sprite.body.velocity.x = -200;
            this.sprite.animations.play('walk', 30, true);
        } else if(dir === 'right'){
            this.sprite.body.velocity.x = 200; 
            this.sprite.scale.x = 1;
            this.sprite.animations.play('walk', 30, true);
        } else if(dir === 'jump'){
            this.sprite.body.velocity.y = -500;
        } else {
            this.sprite.animations.play('stand');
            this.sprite.body.velocity.x = 0;
        }
		
	},

	animations : function() {
		this.sprite.animations.add('walk');
	    this.sprite.animations.add('stand', [4]);
	    this.sprite.animations.add('jump', [10]);
	},
	createName : function() {
		var style = {font: "12px Arial", fill: "#ffffff"};
		var text = game.add.text(0, 0, this.username, style);
	    text.anchor.setTo(1, 3);
	   	this.sprite.addChild(text);
	   	text.setScaleMinMax(1, 2);
	},
	createHPBar : function(w, h, offsetX, offsetY, color) {
	    var bmd = game.make.bitmapData(w || 40, h || 10)
	    bmd.ctx.beginPath();
	    bmd.ctx.rect(0, 0, bmd.width, bmd.height);
	    bmd.ctx.fillStyle = color || '#26b926';
	    bmd.ctx.fill();
	    var sp = game.make.sprite(offsetX || -27, offsetY || -45, bmd);

	    return this.sprite.addChild(sp);
	},
	createWeapon : function(owner) {
	    var w = game.add.group();
	    w.enableBody = true;
	    w.physicsBodyType = Phaser.Physics.ARCADE;
	    w.owner = owner;
	    w.createMultiple(20, 'bullet');
	    w.setAll('checkWorldBounds', true);
	    w.setAll('outOfBoundsKill', true);
	    return w;
	},
	fire : function(pointer) {
	    if(game.time.now > this.nextFire && this.sprite.weapon.countDead() > 0){
	        this.nextFire = game.time.now + this.fireRate;
	        var bullet = this.sprite.weapon.getFirstDead();
	        bullet.reset(this.sprite.x, this.sprite.y);
	        bullet.rotation = game.physics.arcade.angleToXY(bullet, pointer.x, pointer.y);
	        bullet.owner = this.id;
	        game.physics.arcade.moveToObject(bullet, pointer, 500);
	    }
	},
	kill : function() {
		this.sprite.kill();
	}
}