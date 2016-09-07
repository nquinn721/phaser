var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
var users = [];
io.on('connection', function (socket) {
	socket.on('game', function(username) {
		this.user = {id : socket.id, x : (users.length * 100) + 100, y : 550, username : username};
		users.push(this.user);
		this.emit('connected', this.user);
		this.emit('users', getUsersExceptSocket(this));
		this.broadcast.emit('users', [this.user]);
		
	});
	socket.on('move', function(dir) {
		this.broadcast.emit('move', this.user, dir);
	});

	socket.on('fire', function(pointer) {
		this.broadcast.emit('fire', this.user, pointer);
	});
	socket.on('kill player', function(id) {
		users.splice(users.indexOf(socket.user), 1);
		this.broadcast.emit('kill player', id);
	});
	socket.on('disconnect', function() {
		users.splice(users.indexOf(socket.user), 1);
		this.broadcast.emit('disconnected', this.id);
	});
	
});
// var Phaser = require('./phaser.node');
// require('./js/main');

function getUsersExceptSocket(socket) {
	var u = [];
	for(var i = 0; i < users.length; i++)
		if(users[i] !== socket.user)u.push(users[i]);
	return u;
}