
function Map(tileset) {
	// console.log(tileset);
	this.map = JSON.parse(tileset);//{data: [{x: 0, y : 1175, w: 1800, h: 25, el : 'floor', sprite: 'marbleFloor'}], w: 1800, h: 1200};
	this.elements = [];
	
}	


Map.prototype = {
	init : function() {
		this.createTileMap();	
	},
	createTileMap : function() {
		var elements = this.map.data;

		for(var i = 0; i < elements.length; i++){
            this.createElement(elements[i]);
	    }
	},
	createElement : function(el) {
		var e = new MAP_ELEMENTS[el.el]();
	    this.elements.push(e.init(el));
	},
	playerHitElement : function(player, element) {
		element.cl.playerHitElement(element, player);
	},
	bulletHitElement : function(element, bullet) {
		element.cl.bulletHitElement(element, bullet);
	}
}

