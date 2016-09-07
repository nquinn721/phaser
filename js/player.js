function Player(playerObj) {
	this.x = playerObj.x;
	this.y = playerObj.y;
	this.id = playerObj.id;
	this.username = playerObj.username;
	this.sprite = game.add.sprite(this.x, this.y, 'player');
    game.physics.enable( this.sprite, Phaser.Physics.ARCADE);
    console.log(this.username);

    var style = { 
    	font: "12px Arial", 
    	fill: "#ffffff", 
   	};

	var text = game.add.text(0, 0, this.username, style);
    text.anchor.set(1, 3);
   	this.sprite.addChild(text);
   	text.setScaleMinMax(1, 2);
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
	    this.createHPBar(this.sprite, 52, 12, '#ffffff');
	    this.sprite.hpbar = this.createHPBar(this.sprite);
	    return this.sprite;
	},

	animations : function() {
		this.sprite.animations.add('walk');
	    this.sprite.animations.add('stand', [4]);
	    this.sprite.animations.add('jump', [10]);
	},
	createHPBar : function(p, w, h, color, offsetX, offsetY) {
	    var bmd = game.make.bitmapData(w || 50, h || 10)
	    bmd.ctx.beginPath();
	    bmd.ctx.rect(0, 0, bmd.width, bmd.height);
	    bmd.ctx.fillStyle = color || '#26b926';
	    bmd.ctx.fill();
	    var sp = game.make.sprite(offsetX || 0, offsetY || -35, bmd);
	    sp.anchor.setTo(.5, .5);
	   	sp.setScaleMinMax(1, 2);

	    return p.addChild(sp);
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
	}
}