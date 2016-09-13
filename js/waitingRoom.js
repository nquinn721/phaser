function WaitingRoom() {
	this.html = $('.waiting-room');

	socket.on('timer', this.updateTimer.bind(this));
	socket.on('waiting room players', this.update.bind(this));
    socket.on('waiting room', this.init.bind(this));
}

WaitingRoom.prototype = {
	init : function() {
		this.show();

		if(DEBUG.SKIP_WAITING_ROOM){
			this.hide();
			socket.emit('get player');
		}
	},
	show : function() {
		this.html.css('visibility', 'visible');
	},
	hide : function() {
		this.html.css('visibility', 'hidden');	
	},
	updateTimer : function(time) {
		this.html.find('.countdown span').text(time);
	},
	update : function(players) {
		if(!players)return;

		this.html.find('.players').html('');
		for(var i = 0; i < players.length; i++)
			this.html.find('.players').append($('<div>', {text : players[i].username}));
	}
}

var wr = new WaitingRoom;