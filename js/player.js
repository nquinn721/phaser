function Player(playerObj, game) {
	this.x = playerObj.x;
	this.y = playerObj.y;
	this.id = playerObj.id;
	this.username = playerObj.username;
	this.game = game;


	this.sprite = game.add.sprite(this.x, this.y, 'player');
	this.sprite.cl = this;
    this.sprite.hp = 100;
    this.sprite.id = this.id;

	game.physics.enable( this.sprite, Phaser.Physics.ARCADE);


    // Sounds
	this.jumpSound = game.add.audio('jump');
	this.jumpSound.volume = VOLUME;
	this.hitSound = game.add.audio('hitplayer');
	this.hitSound.volume = VOLUME;



    // Weapon
	this.weapon = new Weapon(this);
}

Player.prototype = {
	init : function() {
	    this.animations();
	    this.setupBody();
	    this.setupHP();
	    this.createName();

	    this.sprite.weapon = this.weapon.create('bullet');
	    
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
            this.sprite.body.velocity.y = -600;
            this.jumpSound.play();
        } else {
            this.sprite.animations.play('stand');
            this.sprite.body.velocity.x = 0;
        }
		
	},
	puaseMusic : function() {
		this.weapon.sound.volume = 0;
		this.hitSound.volume = 0;
		this.jumpSound.volume = 0;
	},

	animations : function() {
		this.sprite.animations.add('walk');
	    this.sprite.animations.add('stand', [4]);
	    this.sprite.animations.add('jump', [10]);
	},
	setupBody : function() {
		this.sprite.anchor.setTo(.5,.5);
	    this.sprite.body.collideWorldBounds = true;
	    this.sprite.body.gravity.y = 1000;
	},
	setupHP : function() {
		this.sprite.hp = 100;
	    this.createHPBar(52, 12, null, null, '#ffffff');
	    this.sprite.hpbar = this.createHPBar(50, 10, -26, -44);
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
	hit : function(bullet) {
		console.log(bullet.damage);
		this.sprite.hp -= bullet.damage;
		console.log(this.sprite.hp);
	    this.sprite.tint = 0x861515;
	    this.hitSound.play();
	    this.updateHP();
	    setTimeout(function() {
	        this.sprite.tint = 0xffffff;
	    }.bind(this), 100);
	    if(this.sprite.hp <= 0){
	        this.kill();
	        socket.emit('kill player', this.id);
	    }	
	},
	fire : function(pointer) {
		this.weapon.fire(pointer);
	},
	kill : function() {
		this.sprite.kill();
		// endGame();
	},
	updateHP : function(hp) {
		this.sprite.hpbar.width = (hp || this.sprite.hp) / 2;
	},
	updatePosition : function(position) {
		this.sprite.position.x = position.x;
		this.sprite.position.y = position.y;
	},
	serverUpdate : function(obj) {
		this.updatePosition(obj.position);
		this.updateHP(obj.hp);
	},
	update : function() {
	    // this.bulletBounds = new Phaser.Rectangle(this.sprite.x - 100, this.sprite.y - 100, 200, 200);
	}
}