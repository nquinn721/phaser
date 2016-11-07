var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');

server.listen(3000);

app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
var users = [],
	gameTimer = 15,
	timer;
var map = fs.readFileSync('tilemaps/tilemap.js', 'utf-8');
io.on('connection', function (socket) {
	io.emit('map', map);

	socket.on('waiting room', function() {
		
	});
	socket.on('game', function(username) {
		this.user = {id : socket.id, x : Math.random() * 1900, y : 0, username : username};
		users.push(this.user);
		socket.emit('waiting room');
		io.emit('waiting room players', users);

		if(users.length >= 2)
			startTimer();
	});
	socket.on('get player', function() {
		this.emit('player', this.user);
		console.log('sending');
	});
	function startTimer() {
		if(!timer){

			timer = setInterval(function() {
				io.emit('timer', gameTimer);
				gameTimer--;
				if(gameTimer <= 0){
					io.emit('start game');
					clearTimeout(timer);
				}
			}, 1000);
		}
	}
	socket.on('creating', function() {
		this.emit('users', getUsersExceptSocket(this));
		this.broadcast.emit('users', [this.user]);
	});
	socket.on('move', function(dir) {
		this.broadcast.emit('move', this.user, dir);
	});
	socket.on('player position', function(position) {
		this.broadcast.emit('player position', this.user, position);
	});

	socket.on('fire', function(pointer) {
		this.broadcast.emit('fire', this.user, pointer);
	});
	socket.on('kill player', function(id) {
		users.splice(users.indexOf(socket.user), 1);
		this.broadcast.emit('kill player', id);
	});
	socket.on('disconnect', function() {
		console.log('disconnect', socket.user);
		if(socket.user){
			users.splice(users.indexOf(socket.user), 1);
			this.broadcast.emit('disconnected', this.id);
		}
	});
	
});

function getUsersExceptSocket(socket) {
	var u = [];
	for(var i = 0; i < users.length; i++)
		if(users[i] !== socket.user)u.push(users[i]);
	return u;
}