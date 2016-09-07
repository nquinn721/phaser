var socket = io();

socket.on('move', function(pl, dir) {
    pl = getPlayerById(pl.id);
    move(pl, dir);
});
socket.on('fire', function(pl, pointer) {
    pl = getPlayerById(pl.id);
    if(pl)
        fire(pl, pointer);
});

socket.on('kill player', function(id) {
    killPlayer(id);
});

socket.on('disconnected', function(id) {
   killPlayer(id); 
});
socket.on('users', function(users) {
    // console.log(users);
    for(var i = 0; i < users.length; i++){
        var p = createPlayer(users[i]);
        p.bringToTop();
        players.push(p);
    }
});

socket.on('connected', function(user) {
    var p = createPlayer(user);
    p.bringToTop();
    player = p;

});