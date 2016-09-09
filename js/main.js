var username, game;
$('.login input').on('keyup', function(e) {
    if(e.keyCode === 13){
        username = $(this).val();
        socket.emit('game', username);
        $('.splash').hide();
    }
}).focus();
var playerManager;
socket.on('player', function(user) {
    game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });
    playerManager = new PlayerManager(game);
    player = user;


});
function preload() {

    game.load.image('bullet', 'img/shmup-bullet.png');
    game.load.image('ship', 'img/thrust_ship.png');
    game.load.image('floor', 'img/floor.jpg');
    game.load.image('hp', 'img/health.png');
    game.load.spritesheet('player', 'img/mummy.png', 37, 45, 18);
}

var cursors;
var fireButton;
var players = [];
var player;

var floors = [];
var standing, walking, walkingLeft, walkingRight, jumping;

function fireButton() {
    if(game.input.activePointer.leftButton.isDown)
        return true;
    if(game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).isDown)
        return true;
}

function isMoving(dir) {
    // console.log(player.body.onFloor());
    if(cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A))
        if(dir === 'left')return true;
    if(cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D))
        if(dir === 'right')return true;
    if((cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W)) && (player.sprite.body.onFloor() || player.sprite.body.touching.down))
        if(dir === 'jump')return true;
}



function createFloor(x, y, w, h) {
    var floor = game.add.sprite(x || 0, y || 575, 'floor');
    game.physics.enable(floor, Phaser.Physics.ARCADE);
    floor.body.immovable = true;
    floor.width = w || 800;
    floor.height = h || 25;
    floors.push(floor);
}
function create() {
    socket.emit('creating');
    player = playerManager.createPlayer(player);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.time.advancedTiming = true;
    game.stage.disableVisibilityChange = true;
    cursors = this.input.keyboard.createCursorKeys();
    createFloor();
    createFloor(300, 460, 100, 25);
    createFloor(100, 400, 100, 25);
    createFloor(400, 300, 100, 25);
    createFloor(250, 300, 100, 25);
    createFloor(500, 200, 100, 25);
    createFloor(600, 400, 100, 25);
    
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
    console.log('hit');
    player.health -= 10;
    player.tint = 0x861515;
    player.hpbar.width -= 5;
    // player.hpbar.x -= 2.5;
    setTimeout(function() {
        player.tint = 0xffffff;
    }, 100);
    if(player.health <= 0){
        playerManager.killPlayer(player.id);
        socket.emit('kill player', player.id);
    }

    bullet.kill();

}
function destroyBullet(floor, bullet) {
    bullet.kill();
}
var frames = 0;

function update() {
    frames++;
    var playerSprites = playerManager.getAllPlayerSprites();
        weapons = playerManager.getAllPlayerWeapons(),
        otherPlayerWeapons = playerManager.getOtherPlayerWeapons(),
        otherPlayerSprites = playerManager.getOtherPlayerSprites();


    game.physics.arcade.collide(playerSprites, floors);
    game.physics.arcade.collide(weapons, floors, destroyBullet);
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
            player.fire(game.input.activePointer.position);
            socket.emit('fire', game.input.activePointer.position);
        }


}
function render() {
    game.debug.text("FPS:", 2, 14, "#ffffff");
    game.debug.text(game.time.fps, 40, 14, "#00ff00");
    // game.debug.geom(player.getBounds());
}



