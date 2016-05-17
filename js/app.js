// canvas
var WIDTH = 505;
var HEIGHT = 523;
var ENEMY_PNG = 'images/enemy-bug.png';
var PLAYER_IMAGE = 'images/char-horn-girl.png';
// block
var HORIZON_UNIT_LEN = 101;
var VERTICAL_UNIT_LEN = 83;
var ENEMY_MIN_SPEED = 100;
var ENEMY_MAX_SPEED = 200;
var INITIAL_Y = -20;
// game
var LIFE = 3;

/*** Helpers ***/
function randomNumber(min, max) {
    return function() {
        return Math.floor(Math.random() * (max - min) + min);
    }
}

var randomStart = randomNumber(500, 0);
var randomSpeed = randomNumber(ENEMY_MAX_SPEED, ENEMY_MIN_SPEED);
function randomPos() {
    return [(randomNumber(1, 3))(), (randomNumber(0, 4))()];
}


function getPos(row, col) {
    return [col * HORIZON_UNIT_LEN, row * VERTICAL_UNIT_LEN];
}

/*** Enemies and player ***/
// Enemies our player must avoid
var Enemy;
(function() {
    Enemy = function(info) {
        // Variables applied to each of our instances go here,
        // we've provided one for you to get started

        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        this.sprite = info.png;
        this.x = info.x;
        this.y = info.y;
        this.unit = randomSpeed();
    };

    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    Enemy.prototype.update = function(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        this.x += dt * this.unit;
        if (this.x > WIDTH) {
            this.x = -randomStart();
            this.unit = randomSpeed();
        }
    };

    // Draw the enemy on the screen, required method for game
    Enemy.prototype.render = function() {
        Resources.load(this.sprite);
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

})();


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player;
(function() {
    Player = function(info) {
        Enemy.call(this, info);
        this.initPos = {
            x: info.x,
            y: info.y
        };
        this.life = LIFE;
        this.items = [];
    };
    Player.prototype = Object.create(Enemy.prototype);

    Player.prototype.constructor = Player;
    
    // helper: dead and reset
    Player.prototype.resetDead = function() {
        this.x = this.initPos.x;
        this.y = this.initPos.y;
        this.life--;
    };
    
    // helper: out of field
    Player.prototype.outField = function() {
        var upper = 0;
        var downer = HEIGHT - VERTICAL_UNIT_LEN;
        var lefter = 0;
        var righter = WIDTH - HORIZON_UNIT_LEN;
        if (this.x < lefter || this.x > righter || this.y < upper || this.y > downer) {
            this.resetDead();
        }
    };
    
    // interface: get items
    Player.prototype.getItem = function(item) {
        // todo: if item has preq.... if not...
        // clean the list
    };
    
    Player.prototype.render = function() {
        // render player pic
        Enemy.prototype.render.call(this);
    };

    Player.prototype.update = function() {
        this.outField();
    };

    Player.prototype.handleInput = function(keydown) {
        switch (keydown) {
            case 'up':
                this.y -= VERTICAL_UNIT_LEN;
                break;
            case 'down':
                this.y += VERTICAL_UNIT_LEN;
                break;
            case 'left':
                this.x -= HORIZON_UNIT_LEN;
                break;
            case 'right':
                this.x += HORIZON_UNIT_LEN;
                break;
            default:
                break;
        }
    };
})();


/** Score board **/
var ScoreBoard;
(function() {
    ScoreBoard = function(enemies, extras, player) {
        this.enemies = allEnemies;
        this.extras = extras;
        this.player = player;
        this.score = 0;
        this.life = LIFE;
    };
    
    // Update the score
    ScoreBoard.prototype.update = function() {
        this.lifeCal();
        this.scoreCal();
    };

    // Render the score text
    ScoreBoard.prototype.render = function() {
        // lives
        ctx.font = "20px Monaco";
        ctx.fillStyle = "Brown";
        ctx.fillText('HP: ' + player.life, 370, 90);
        // scores
        ctx.fillText('Scores: ' + this.score, 370, 115);
    };

    // helper: life calculator
    ScoreBoard.prototype.lifeCal = function() {
        // player out of field
        // bug crashed
        for (var i = 0; i < this.enemies.length; i++) {
            var bug = this.enemies[i];
            // alert('before bug');
            if (this.isBugCrashed(bug)) {
                player.resetDead();
            }
        }
    };
    
    // helper: score calculator
    ScoreBoard.prototype.scoreCal = function() {
        // todo
    };
    
    // helper: crash into a bug?
    ScoreBoard.prototype.isBugCrashed = function(bug) {
        return (Math.abs(bug.x - player.x) < 40 &&
        Math.abs(bug.y - player.y) < 40);
    };

})();


/**** Objects ****/
// helper: produce a temp object
function extraDef(v, tf, tl, pr) {
    return {
        value: v,
        timeFreq: tf,
        timeLast: tl,
        preq: pr
    };
}

// Definition of different extras
var EXTRAS = {
    heart: extraDef(10, 200, 300, ""),
    keys: extraDef(10, 200, 300, ""),
    rock: extraDef(10, 200, 300, ""),
    star: extraDef(10, 100, 150, ""),
    boxStar: extraDef(10, 200, 300, "keys"),
    blueGem: extraDef(10, 20, 30, ""),
    greenGem: extraDef(10, 20, 30, ""),
    orangeGem: extraDef(10, 20, 30, "")
};

var EXTRA_PICS = {
    heart: 'images/Heart.png',
    keys: 'images/Key.png',
    rock: 'images/Rock.png',
    star: 'images/Star.png',
    boxStar: 'images/Selector.png',
    blueGem: 'images/Gem Blue.png',
    greenGem: 'images/Gem Green.png',
    orangeGem: 'images/Gem Orange.png'
};

var Extra;
(function() {
    Extra = function(name) {
        this.name = name;
        var obj = EXTRAS[name];
        this.value = obj.value;
        this.resetClock = [obj.timeFreq, obj.timeLast];
        this.clock = 0;
        this.preq = EXTRAS[obj.preq];       // an object
        this.pic = EXTRA_PICS[name];
        this.shown = true;
        this.pos = randomPos();
    };

    Extra.prototype.update = function() {
        this.clock++;
        if (this.shown) {
            if (this.clock > this.resetClock[1]) {
                this.shown = false;
                this.clock = 0;
            }
        } else {
            if (this.clock > this.resetClock[0]) {
                this.pos = randomPos();
                this.shown = true;
                this.clock = 0;
            }
        }
    };
    
    Extra.prototype.render = function() {
        if (this.shown) {
            Resources.load(this.pic);
            console.log(this.pos[0] + " " + this.pos[1]);
            var cord = getPos(this.pos[0], this.pos[1]);
            ctx.drawImage(Resources.get(this.pic), cord[0], cord[1]);       // fixme
        }
    }
    
})();


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [
    new Enemy({
        png: ENEMY_PNG,
        x: -randomStart(),
        y: INITIAL_Y + VERTICAL_UNIT_LEN
    }),
    new Enemy({
        png: ENEMY_PNG,
        x: -randomStart(),
        y: INITIAL_Y + VERTICAL_UNIT_LEN * 2
    }),
    new Enemy({
        png: ENEMY_PNG,
        x: -randomStart(),
        y: INITIAL_Y + VERTICAL_UNIT_LEN * 3
    })
];
var player = new Player({
    png: PLAYER_IMAGE,
    x: HORIZON_UNIT_LEN * 2,
    y: VERTICAL_UNIT_LEN * 4 - 10 // modified the pic's position
});

var extras = [
    new Extra("star")
];

var scoreBoard = new ScoreBoard(allEnemies, extras, player);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});