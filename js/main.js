var username, game, VOLUME = 0.3;
$('.login input').on('keyup', function(e) {
    
    if(e.keyCode === 13){
        if($(this).val() === ""){
            $('.login-failed').show();
            return;
        }
        username = $(this).val();
        socket.emit('game', username);
        $('.splash').hide();
    }
}).focus();


if(DEBUG.AUTO_LOGIN){
    $('.splash').hide();
    socket.emit('game', DEBUG.LOGIN_NAME);
}


$('.pause').on('click', function() {
    pauseAllSounds();
});




function pauseAllSounds() {
    var players = playerManager.allPlayers;
    for(var i = 0; i < players.length; i++)
        players[i].puaseMusic();
    pauseMusic();
}


var playerManager;

socket.on('start game', function(user) {
    socket.emit('get player');
});

socket.on('player', function(user) {
    wr.hide();
    game = new Phaser.Game(1200, 700, Phaser.CANVAS/*Phaser.AUTO*/, 'wrapper', { preload: preload, create: create, update: update, render: render });
    playerManager = new PlayerManager(game);
    player = user;

});
function preload() {
    game.load.tilemap('map', 'tilemaps/main.csv');
    game.load.image('tiles', 'tilemaps/tiles.jpg');

    game.load.image('bullet', 'img/bullet.png');
    game.load.image('missle', 'img/missle.png');

    game.load.image('ship', 'img/thrust_ship.png');
    game.load.image('marbleFloor', 'img/floor.jpg');
    game.load.spritesheet('player', 'img/mummy.png', 37, 45, 18);
    game.load.audio('laser', ['sound/laser.mp3', 'sound/laser.ogg']);
    game.load.audio('missle', ['sound/missle.mp3', 'sound/missle.ogg']);
    game.load.audio('jump', ['sound/jump.mp3', 'sound/jump.ogg']);
    game.load.audio('hitplayer', ['sound/hitplayer.mp3', 'sound/hitplayer.ogg']);
    game.load.audio('bgmusic', ['sound/bgmusic.mp3', 'sound/bgmusic.ogg']);
    game.load.audio('gameover', ['sound/gameover.mp3', 'sound/gameover.ogg']);
}

var cursors;
var fireButton;
var players = [];
var player;
var bgmusic, gameover;
var map;

var standing, walking, walkingLeft, walkingRight, jumping, moving;

function fireButton() {
    if(game.input.activePointer.leftButton.isDown)
        return true;
    if(game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).isDown)
        return true;
}

function isMoving(dir) {
    if(cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A))
        if(dir === 'left')return true;
    if(cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D))
        if(dir === 'right')return true;
    if((cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W)) && (player.sprite.body.onFloor() || player.sprite.body.touching.down))
        if(dir === 'jump')return true;
}

function endGame() {
    bgmusic.stop();
    gameover.play();
    $('.end-game').css('visibility', 'visible');
}


function create() {
    map = new Map;
    map.init();
    socket.emit('creating');
    player = playerManager.createPlayer(player);
    playerManager.init();
    game.world.setBounds(0,0, map.map.w , map.map.h);
    // game.world.setBounds(0,0, 1600 , 1200);

    game.camera.follow(player.sprite);
    game.camera.focusOnXY(0, 0);
    // game.camera.deadzone = new Phaser.Rectangle(30, 300, 100, 0);
    game.physics.startSystem(Phaser.Physics.ARCADE)
    game.time.advancedTiming = true;
    game.stage.disableVisibilityChange = true;
    bgmusic = game.add.audio('bgmusic')
    bgmusic.loopFull();
    bgmusic.volume = VOLUME;
    gameover = game.add.audio('gameover');
    gameover.volume = VOLUME;
    cursors = this.input.keyboard.createCursorKeys();


    if(DEBUG.NO_SOUNDS)
        pauseAllSounds();
    
}

function pauseMusic() {
    bgmusic.stop();
}

function movePlayer(dir) {
    if(dir === 'left'){
        if(!moving){
            socket.emit('move', 'left');
            standing = false;
            moving = true;
        }
    } else if(dir === 'right'){
        if(!moving){
            socket.emit('move', 'right');
            moving = true;
            standing = false;
        }
    } else if(dir === 'jump'){
        socket.emit('move', 'jump');
        moving = false;
        standing = false;
    } else {
        if(!standing){
            socket.emit('move', 'stand');
            moving = false;
            standing = true;
        }
    }
}

function hitPlayer(player, bullet) {
    player.cl.hit(bullet);
    bullet.kill();

}
function destroyBullet(bullet, floor) {
    bullet.kill();
}
var frames = 0;

function update() {
    frames++;
    var playerSprites = playerManager.getAllPlayerSprites();
        weapons = playerManager.getAllPlayerWeapons(),
        players = playerManager.allPlayers,
        otherPlayerWeapons = playerManager.getOtherPlayerWeapons(),
        otherPlayerSprites = playerManager.getOtherPlayerSprites();


    game.physics.arcade.collide(playerSprites, map.elements, map.playerHitElement);
    game.physics.arcade.collide(weapons, map.elements, map.bulletHitElement);
    game.physics.arcade.overlap(otherPlayerSprites, player.sprite.weapon , hitPlayer, null, this);
    game.physics.arcade.overlap(player.sprite, otherPlayerWeapons, hitPlayer, null, this);
    
    if (isMoving('left')) {
        player.move('left');
        movePlayer('left');
    } else if (isMoving('right')) {
        player.move('right');
        movePlayer('right');
    }  else {
        player.move('stand');
        movePlayer('stand');
    }
    if(isMoving('jump')){
        player.move('jump');
        movePlayer('jump');
    }

        if (fireButton()) {
            var obj = {x : game.input.activePointer.worldX, y : game.input.activePointer.worldY};
            player.fire(obj);
            socket.emit('fire', obj);
        }

    for(var i = 0; i < players.length; i++)
        players[i].update();

}
function render() {
    game.debug.text("FPS:", 2, 14, "#ffffff");
    game.debug.text(game.time.fps, 40, 14, "#00ff00");
    // game.debug.geom(player.bulletBounds, '#0fffff')
    // game.debug.geom(player.getBounds());
}



