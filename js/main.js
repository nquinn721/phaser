function Start(Phaser) {
    
    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });
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
    var fireRate = 200;
    var nextFire = 0;
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
        if((cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W)) && (player.body.onFloor() || player.body.touching.down))
            if(dir === 'jump')return true;
    }

    var text;
    function createWeapon(owner) {
        var w = game.add.group();
        w.enableBody = true;
        w.physicsBodyType = Phaser.Physics.ARCADE;
        w.owner = owner;
        w.createMultiple(20, 'bullet');
        w.setAll('checkWorldBounds', true);
        w.setAll('outOfBoundsKill', true);
        return w;
    }

    function createPlayer(user) {
        var p = game.add.sprite(user.x, user.y, 'player');
        p.animations.add('walk');
        p.animations.add('stand', [4]);
        p.animations.add('jump', [10]);
        p.anchor.setTo(.5,.5);
        game.physics.enable( p, Phaser.Physics.ARCADE);
        p.body.collideWorldBounds = true;
        p.body.gravity.y = 1000;
        p.weapon = createWeapon(p);
        p.id = user.id;
        p.health = 100;
        createHPBar(p, 52, 12, '#ffffff');
        p.hpbar = createHPBar(p);

        return p;
    }
    function createHPBar(p, w, h, color, offsetX, offsetY) {
        var bmd = game.make.bitmapData(w || 50, h || 10)
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, bmd.width, bmd.height);
        bmd.ctx.fillStyle = color || '#26b926';
        bmd.ctx.fill();
        var sp = game.make.sprite(offsetX || 0, offsetY || -35, bmd)
        sp.anchor.setTo(.5, .5);
        return p.addChild(sp);
    }

    function killPlayer(id) {
        getPlayerById(id).kill();
    }
    var socket = io();
    socket.on('connected', function(user) {
        // console.log(coords);
        var p = createPlayer(user);
        p.bringToTop();
        player = p;
    game.camera.follow(p);

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

    function createFloor(x, y, w, h) {
        var floor = game.add.sprite(x || 0, y || 575, 'floor');
        game.physics.enable(floor, Phaser.Physics.ARCADE);
        floor.body.immovable = true;
        floor.width = w || 800;
        floor.height = h || 25;
        floors.push(floor);
    }
    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        socket.emit('game');
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
    function move(p, dir) {
        if(!p)return;

        if(dir === 'left'){
            p.scale.x = -1;
            p.body.velocity.x = -200;
            p.animations.play('walk', 30, true);
        } else if(dir === 'right'){
            p.body.velocity.x = 200; 
            p.scale.x = 1;
            p.animations.play('walk', 30, true);
        } else if(dir === 'jump'){
            p.body.velocity.y = -500;
        } else {
            p.animations.play('stand');
            p.body.velocity.x = 0;
        }
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
        if(id === player.id)
            player = null;
    });

    function getPlayerById(id) {
        for(var i = 0; i < players.length; i++)
            if(players[i].id === id)return players[i];
    }
    function hitPlayer(player, bullet) {
        player.health -= 10;
        player.tint = 0x861515;
        player.hpbar.width -= 5;
        player.hpbar.x -= 2.5;
        setTimeout(function() {
            player.tint = 0xffffff;
        }, 100);
        if(player.health <= 0){
            player.kill();
            socket.emit('kill player', player.id);
        }

        bullet.kill();

    }
    function destroyBullet(floor, bullet) {
        bullet.kill();
    }
    function update() {
        game.physics.arcade.collide(players, floors);
        if(player){
            game.physics.arcade.collide(player, floors);
            game.physics.arcade.collide(player.weapon, floors, destroyBullet);
            for(var i = 0; i < players.length; i++){
                game.physics.arcade.collide(players[i].weapon, floors, destroyBullet);
                game.physics.arcade.overlap(player.weapon, players[i], hitPlayer, null, this);
                game.physics.arcade.overlap(players[i].weapon, player, hitPlayer, null, this);
            }
            
            if (isMoving('left')) {
                move(player, 'left');
                movePlayer('left');
            } else if (isMoving('right')) {
                move(player, 'right');
                movePlayer('right');
            }  else {
                move(player, 'stand');
                movePlayer('stand');
            }
            if(isMoving('jump')){
                move(player, 'jump');
                movePlayer('jump');
            }

            if (fireButton()) {
                // console.log(game.input.activePointer.position);
                fire(player, game.input.activePointer.position);
                socket.emit('fire', game.input.activePointer.position);
            }
        }


    }
    function fire(player, pointer) {
        if(!player)return;

        if(game.time.now > nextFire && player.weapon.countDead() > 0){
            nextFire = game.time.now + fireRate;
            var bullet = player.weapon.getFirstDead();
            bullet.reset(player.x, player.y);
            // bullet.rotation = game.physics.arcade.angleToPointer(bullet, pointer);
            bullet.rotation = game.physics.arcade.angleToXY(bullet, pointer.x, pointer.y);
            bullet.owner = player.id;
            // game.physics.arcade.moveToPointer(bullet, 300, pointer);
            game.physics.arcade.moveToObject(bullet, pointer, 500);
        }
    }

    function render() {
        game.debug.text(game.time.fps, 2, 14, "#00ff00");
        // game.debug.geom(player.getBounds());
    }

}


if(typeof module === 'undefined')
    Start(Phaser);
else module.exports = Start;