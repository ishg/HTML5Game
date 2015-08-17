$(document).ready(function () {

    var canvas = $("#canvas")[0];
    var c = canvas.getContext("2d");
    
    var CANVAS_WIDTH = 650,
        CANVAS_HEIGHT = 650,
        axl = 1,
        balloonSpeed = 1,
        numBalloons = 0.96,
        tw = 30,
        bw = 40,
        th = 40,
        bh = 10,
        btn = $(".btn"),
        background = Sprite("background"),
        mouseX,
        mouseY;
    $(document).mousemove(function (e) {
        mouseX = e.pageX;
        mouseY = e.pageY;
    });

    document.documentElement.addEventListener('keydown', function (e) {
        if ((e.keycode || e.which) == 32) {
            e.preventDefault();
            player.shoot();
        }
    }, false);

    function welcome() {
        c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        c.fillStyle = "blue";
        c.font = "50px Georgia";
        c.textAlign = "center";
        c.fillText("Bows", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
        c.fillStyle = "green";
        c.fillText("And", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
        c.fillStyle = "red";
        c.fillText("Balloons", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        c.fillStyle = "black";
        c.font = "25px Calibri";
        c.fillText("W and D to Move", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
        c.fillText("Arrow Keys to aim", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);
        c.fillText("Spacebar to Shoot", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 160);
    }
    welcome();

    /* CREATE THE HUD */
    var scoreboard = {
        x: 10,
        y: 20,
        level: 1,
        height: 40,
        width: 100,
        score: 0,
        highscore: 0,
        gameover: 0,
        levellingup: 7,
        levelup: false,
        draw: function () {
            c.fillStyle = "yellow";
            c.font = "bold 15px Calibri";
            c.fillText("Level:" + this.level, this.x, this.y);
            c.fillText("Score:" + this.score, this.x, this.y + 20);
            c.fillText("High Score: " + this.highscore, this.x, this.y + 40);
            if (this.levelup) {
                if (this.levellingup >= 0) {
                    c.font = "bold 30px Calibri";
                    c.textAlign = "center";
                    c.fillText("Level " + this.level + "!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
                    this.levellingup -= 1;
                } else {
                    this.levelup = false;
                    this.levellingup = 7;
                }
            }
        },
        update: function () {
            if (scoreboard.score == scoreboard.level * 10) {
                balloonSpeed = balloonSpeed + 1;
				numBalloons = 1-(scoreboard.level*2+1)/100.0 - 0.02;
				scoreboard.level +=1;
				scoreboard.levelup = true;
            }
        }
    };

    /* CREATE THE PLAYER */
    var player = {
        color: "#000",
        width: 32,
        height: 32,
        x: CANVAS_WIDTH / 2 - tw / 2,
        y: CANVAS_HEIGHT - th,
        tx: CANVAS_WIDTH / 2,
        ty: CANVAS_HEIGHT / 2,
        draw: function () {
            //Draw the tank
            c.fillStyle = this.color;
            c.fillRect(this.x, this.y, this.width, this.height);

            var center = player.midpoint();
            if (this.ty <= (center.y - (this.height / 2))) {
                //Draw the aim
                c.beginPath();
                c.moveTo(center.x, center.y - (this.height / 2));
                c.lineTo(this.tx, this.ty);
                c.strokeStyle = "silver";
                c.stroke();
                //Draw Cross-hairs
                c.beginPath();
                c.moveTo(this.tx - 5, this.ty);
                c.lineTo(this.tx + 5, this.ty);
                c.moveTo(this.tx, this.ty + 5);
                c.lineTo(this.tx, this.ty - 5);
                c.lineWidth = 1;
                c.strokeStyle = "black";
                c.stroke();
                //Calculate angle
                var y = Math.abs(center.y - (this.height / 2) - this.ty),
                    x = Math.abs(this.tx - center.x),
                    theta = Math.atan2(y, x),
                    dX = 20 * Math.cos(theta),
                    dY = 20 * Math.sin(theta),
                    newY = center.y - (this.height / 2) - dY,
                    newX = 0;
                if (this.tx >= center.x) {
                    newX = center.x + dX;
                } else {
                    newX = center.x - dX;
                }
                //Draw the turret
                c.beginPath();
                c.moveTo(center.x, center.y - (this.height / 2));
                c.lineWidth = 10;
                c.lineCap = "round";
                c.lineTo(newX, newY);
                c.strokeStyle = "#458B00";
                c.stroke();
            } else {
                //Don't let turret go below horizontal
                c.moveTo(center.x, center.y - (this.height / 2));
                c.lineTo(this.tx, center.y - (this.height / 2));
                c.strokeStyle = "black";
                c.stroke();
                c.beginPath();
                c.moveTo(center.x, center.y - (this.height / 2));
                c.lineWidth = 10;
                c.lineCap = "round";
                if (this.tx >= center.x) {
                    c.lineTo(center.x + 20, center.y - (this.height / 2));
                } else {
                    c.lineTo(center.x - 20, center.y - (this.height / 2));
                }
                c.strokeStyle = "#458B00";
                c.stroke();
            }
        },
        update: function () {
            if (keydown.a) {
                this.x -= 5;
            }

            if (keydown.d) {
                this.x += 5;
            }

            if (keydown.left) {
                this.tx -= 15;
            }

            if (keydown.right) {
                this.tx += 15;
            }

            if (keydown.up) {
                this.ty -= 15;
            }
            if (keydown.down) {
                this.ty += 15;
            }
        },
    };

    var playerBullets = [];

    function Bullet(I) {
        I.active = true;
        // # TODO - determine x speed;
        I.xVelocity = I.xSpeed;
        I.yVelocity = -I.ySpeed;
        I.width = 3;
        I.height = 3;
        I.color = "#000";

        I.inBounds = function () {
            return I.x >= 0 && I.x <= CANVAS_WIDTH &&
                I.y >= 0 && I.y <= CANVAS_HEIGHT;
        };

        I.draw = function () {
            c.fillStyle = this.color;
            c.fillRect(this.x, this.y, this.width, this.height);
        };

        I.update = function () {
            I.x += I.xVelocity;
            I.y += I.yVelocity;
            I.yVelocity += axl;

            //Bullet is active while it is inside bounds
            I.active = I.active && I.inBounds();
        };

        return I;
    };

	
	enemies = [];
	function Enemy(I){
		I = I||{};
		I.active = true;
		I.age = Math.floor(Math.random()*128);
		I.explosion = 10.0;
		I.exploding = false;
		
		I.color = "#FF0000";
		
		I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH/2;
		I.y = 0;
		I.xVelocity = 0;
		I.yVelocity = balloonSpeed;
		
		I.width = 32;
		I.height = 32;
		
		I.inBounds = function(){
			return I.x >= 0 && I.x <= CANVAS_WIDTH &&
				I.y >= 0 && I.y <= CANVAS_HEIGHT;
		};
		var chooseBalloon = Math.random();
		if(chooseBalloon <0.25){
			I.sprite = Sprite("red_balloon");
		}else if(chooseBalloon < 0.5){
			I.sprite = Sprite("blue_balloon");
		}else if(chooseBalloon<0.75){
			I.sprite = Sprite("green_balloon");
		}else{
			I.sprite = Sprite("yellow_balloon");
		}
		I.draw = function(){
			this.sprite.draw(c,this.x,this.y);
		};
		I.explode = function(){
			I.exploding = true;
			I.sprite = Sprite("black_balloon");
		};
		I.update = function(){
			if(!I.exploding){
				I.x+= I.xVelocity;
				I.y+= I.yVelocity;
				I.xVelocity = 3* Math.sin(I.age * Math.PI/64);
				I.age++;
			}else{
				if(I.explosion>=0){
					I.explosion -=1;
				}else{
					this.active = false;
				}
			}
			I.active = I.active && I.inBounds();
		};
		return I;
	};
	
	function collides(a, b) {
		return a.x < b.x + b.width &&
			 a.x + a.width > b.x &&
			 a.y < b.y + b.height &&
			 a.y + a.height > b.y;
	}
	
	function handleCollisions() {
		playerBullets.forEach(function(bullet) {
			enemies.forEach(function(enemy) {
				if (collides(bullet, enemy)) {
					enemy.explode();
					bullet.active = false;
					scoreboard.score+=1;
				}
			});
		});
		
		enemies.forEach(function(enemy) {
			if (collides(enemy, player)) {
				enemy.explode();
				player.explode();
			}else if(enemy.y+1>CANVAS_HEIGHT){
				scoreboard.score -=1;
			}
		});
		
	}
	
	player.explode = function(){
		this.active = false;
		clearInterval(refreshIntervalId);
		scoreboard.gameover = 1;
	};
    
    function update(){
        
        player.x = player.x.clamp(0, CANVAS_WIDTH - player.width);

        playerBullets.forEach(function (bullet) {
            bullet.update();
        });

        playerBullets = playerBullets.filter(function (bullet) {
            return bullet.active;
        });

        enemies.forEach(function (enemy) {
            enemy.update();
        });

        enemies = enemies.filter(function (enemy) {
            return enemy.active;
        });
        scoreboard.update();
        if (Math.random() > numBalloons) {
            enemies.push(Enemy());
        }

        handleCollisions();

    };

    function draw() {
        canvas.width = canvas.width;

        background.draw(c, 0, 0);
        player.update();
        player.draw();
        //player.drawTurret();
        playerBullets.forEach(function (bullet) {
            bullet.draw();
        });
        enemies.forEach(function (enemy) {
            enemy.draw();
        });
        scoreboard.draw();
    }

    player.shoot = function () {
        var bulletPosition = this.midpoint();

        var y = Math.abs(bulletPosition.y - (this.height / 2) - player.ty),
            x = Math.abs(bulletPosition.x - player.tx),
            distance = Math.sqrt(y * y + x * x),
            theta = Math.atan2(y, x);
        var Vz = distance / 15;
        var Vy = Vz * Math.sin(theta);
        var Vx = Vz * Math.cos(theta);
        if (player.tx >= bulletPosition.x) {
            Vx = Vx;
        } else {
            Vx = -Vx;
        }

        playerBullets.push(Bullet({
            xSpeed: Vx,
            ySpeed: Vy,
            x: bulletPosition.x,
            y: bulletPosition.y - this.height / 2
        }));
    }
    player.midpoint = function () {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    };


    //Game Loop

    var FPS = 30;

    function start_game() {
        refreshIntervalId = setInterval(function () {
            update();
            draw();
            if (scoreboard.gameover == 1) {
                c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                c.fillStyle = "blue";
                c.font = "50px Georgia";
                c.textAlign = "center";
                c.fillText("Game Over!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
                c.fillStyle = "green";
                c.font = "25px Calibri";
                c.fillText("Score: " + scoreboard.score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
                btn.prop("disabled", false);
                btn.html("Play Again");
                if (scoreboard.score > scoreboard.highscore) {
                    scoreboard.highscore = scoreboard.score;
                }
            }
        }, 1000 / FPS);
    }

    btn.click(function () {
        if (scoreboard.gameover == 0) {
            btn.prop("disabled", true);
            start_game();
        } else {
            scoreboard.gameover = 0;
            scoreboard.score = 0;
            enemies.length = 0;
            playerBullets.length = 0;
            btn.prop("disabled", true);
            balloonSpeed = 4;
            numBalloons = 0.96;
            start_game();
        }
    });

});
