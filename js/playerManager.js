function PlayerManager(game) {
	this.allPlayers = [];
	this.otherPlayers = [];
	this.player;

	this.game = game;
	this.frames = 0;
}

PlayerManager.prototype = {
	init : function() {
		this.sendPlayerUpdate();	
	},
	/**
	 * @CREATORS
	 */
	createPlayer : function(user) {
		var p = this.initNewPlayer(user);

		this.player = p;
		this.allPlayers.push(p);
		
		return p;
	},
	createOtherPlayer : function(user) {
		var p = this.initNewPlayer(user);

        this.otherPlayers.push(p);
        this.allPlayers.push(p);

        return p;
	},
	initNewPlayer : function(user) {
		var p = new Player(user, this.game);
    	p.init();
        p.sprite.bringToTop();
        this.resetPlayerSpriteCollections();
    	return p;	
	},
	/**
	 * @END CREATORS
	 */

	resetPlayerSpriteCollections : function() {
		this.allPlayerSprites = null;
		this.allPlayerWeapons = null;
		this.otherPlayerSprites = null;
		this.otherPlayerWeapons = null;
	},
	killPlayer : function(id) {
	    var pl = this.getPlayerById(id)
	    if(pl)
		    pl.kill();
	},

	sendPlayerUpdate : function() {
		setInterval(function() {
			socket.emit('player position', {position : this.player.sprite.position, hp : this.player.sprite.hp})
		}, 200);	
	},
	updatePlayer : function(player, position) {
		var pl = this.getPlayerById(player);

		if(pl)pl.serverUpdate(position);
	},

	/**
	 * @GETTERS
	 */

	// Sprite Collections
	getAllPlayerSprites : function() {
		if(!this.allPlayerSprites)
			this.allPlayerSprites = this.allPlayers.map(function(p) {
				return p.sprite;
			});
		return this.allPlayerSprites;
	},
	getAllPlayerWeapons : function() {
		if(!this.allPlayerWeapons)
			this.allPlayerWeapons = this.getAllPlayerSprites().map(function(p) {
				return p.weapon;
			});
		return this.allPlayerWeapons;
	},
	getOtherPlayerSprites : function() {
		if(!this.otherPlayerSprites)
			this.otherPlayerSprites = this.getOtherPlayers().map(function(p) {
				return p.sprite;
			});
		return this.otherPlayerSprites;
	},
	getOtherPlayerWeapons : function() {
		if(!this.otherPlayerWeapons)
			this.otherPlayerWeapons = this.getOtherPlayerSprites().map(function(p) {
				return p.weapon;
			});
		return this.otherPlayerWeapons;
	},
	// End Sprite Collections

	// Get Player Objects
	getOtherPlayers : function() {
		return this.otherPlayers;
	},
	getPlayer : function() {
		return ths.player;
	},
	getAllPlayers : function() {
		return this.allPlayers;
	},
	getPlayerById : function(id) {
		if(!id)return;

		id = typeof id === 'string' ? id : id.id;

	    for(var i = 0; i < this.allPlayers.length; i++)
	        if(this.allPlayers[i].id === id)return this.allPlayers[i];
	}
	// End Get Player Objects

	/**
	 * @END GETTERS
	 */
}

