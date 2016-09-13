var socket = io();
function Sockets() {
    
}

Sockets.prototype = {
    init : function() {
        console.log('socket init');
        socket.on('move', this.handleSocketEvent.bind(this, 'move'));
        socket.on('fire', this.handleSocketEvent.bind(this, 'fire'));
        socket.on('kill player', this.handleSocketEvent.bind(this, 'killPlayer'));
        socket.on('users', this.handleSocketEvent.bind(this, 'users'));
        socket.on('disconnected', this.handleSocketEvent.bind(this, 'disconnected'));
        socket.on('player position', this.handleSocketEvent.bind(this, 'playerPosition'));
    },
    handleSocketEvent : function(event) {
        if(typeof playerManager === 'undefined')return;
        var args = [].splice.call(arguments, 1);
        this[event].apply(this, args);
    },
    move : function(pl, dir) {
        pl = playerManager.getPlayerById(pl.id);
        if(pl)
            pl.move(dir);
    },
    fire : function(pl, pointer) {
        pl = playerManager.getPlayerById(pl.id);
        if(pl)
            pl.fire(pointer);
    },

    killPlayer : function(id) {
        playerManager.killPlayer(id);
    },

    disconnected : function(id) {
        playerManager.killPlayer(id); 
    },
    users : function(users) {
        for(var i = 0; i < users.length; i++){
            playerManager.createOtherPlayer(users[i]);
        }
    },
    playerPosition : function(player, position) {
        playerManager.updatePlayer(player, position);
    }

}
var sockets = new Sockets;
sockets.init();