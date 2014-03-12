$(document).ready(function(){
    
    var canvas = $("#canvas")[0];
    var c = canvas.getContext("2d");
    var CANVAS_WIDTH = 450, CANVAS_HEIGHT= 450;
    var tw = 30,
		bw = 40,
		th = 40,
		bh = 10;
	var btn = $(".btn");
	var mouseX;
	var mouseY;
	$(document).mousemove(function(e) {
		mouseX = e.pageX;
		mouseY = e.pageY;
	});
	
	function welcome(){
		c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		c.fillStyle = "blue";
		c.font ="50px Georgia";
		c.textAlign = "center";
		c.fillText("Bows",CANVAS_WIDTH/2,CANVAS_HEIGHT/2-100);
		c.fillStyle = "green";
		c.font ="50px Georgia";
		c.textAlign = "center";
		c.fillText("And",CANVAS_WIDTH/2,CANVAS_HEIGHT/2-50);
		c.fillStyle = "red";
		c.font ="50px Georgia";
		c.textAlign = "center";
		c.fillText("Balloons",CANVAS_WIDTH/2,CANVAS_HEIGHT/2);
		
		c.fillStyle = "black";
		c.font = "25px Calibri";
		c.fillText("Arrow Keys to Move",CANVAS_WIDTH/2,CANVAS_HEIGHT/2+80);
		c.fillText("Mouse to Shoot",CANVAS_WIDTH/2,CANVAS_HEIGHT/2+120);
		
		
	}
	welcome();
	
	/* CREATE THE HUD */
	var scoreboard = {
		x:20,
		y:20,
		height:40,
		width:100,
		score:0,
		highscore:0,
		gameover:0,
		draw:function(){
			c.fillStyle = "#000";
			c.fillText("Score:", this.x,this.y);
			c.fillText(this.score, this.x+40,this.y);
			c.fillText("High Score: "+this.highscore,370,this.y);
		}
	};
	
	/* CREATE THE PLAYER */
    var player = {
        color:"#000",
        width:32,
        height:32,
        x:CANVAS_WIDTH/2-tw/2,
        y:CANVAS_HEIGHT-th,
        draw:function(){
            c.fillStyle = this.color;
            c.fillRect(this.x,this.y, this.width, this.height);
        },
		drawTurret: function(){
			var center = player.midpoint();
			if(mouseY <= (center.y-(this.height/2))){
				//Draw the aim
				c.beginPath();
				c.moveTo(center.x,center.y-(this.height/2));
				c.lineTo(mouseX,mouseY);
				c.strokeStyle = "silver";
				c.stroke();
				//Draw Cross-hairs
				c.beginPath();
				c.moveTo(mouseX - 5, mouseY);
				c.lineTo(mouseX + 5, mouseY);
				c.moveTo(mouseX, mouseY + 5);
				c.lineTo(mouseX, mouseY - 5);
				c.strokeStyle = "silver";
				c.lineWidth = 1;
				c.stroke();
				//Calculate angle
				var y = Math.abs(center.y-(this.height/2) - mouseY),
				x = Math.abs(mouseX - center.x),
				theta = Math.atan2(y, x),
				dX = 20 * Math.cos(theta),
				dY = 20 * Math.sin(theta),
				newY = center.y - (this.height/2) - dY,
				newX = 0;
				if (mouseX >= center.x) {
					newX = center.x + dX;
				} else {
					newX = center.x - dX;
				}
				//Draw the turret
				c.beginPath();
				c.moveTo(center.x,center.y-(this.height/2));
				c.lineWidth = 10;
				c.lineCap  = "round";
				c.lineTo(newX,newY);
				c.strokeStyle = "#458B00";
				c.stroke();
			}else {
				//Don't let turret go below horizontal
				c.moveTo(center.x, center.y-(this.height/2));
				c.lineTo(mouseX, center.y-(this.height/2));
				c.strokeStyle = "silver";
				c.stroke();
				c.beginPath();
				c.moveTo(center.x, center.y-(this.height/2));
				c.lineWidth = 10;
				c.lineCap = "round";
				if (mouseX >= center.x) {
					c.lineTo(center.x + 20, center.y-(this.height/2));
				} else {
					c.lineTo(center.x - 20, center.y-(this.height/2));
				}
				c.strokeStyle = "#458B00";
				c.stroke();
			}
		}
    };
    
    $("#wrapper").click(function(){
        player.shoot();
    });
	
	
    
    var playerBullets = [];
    function Bullet(I) {
        I.active = true;
		// # TODO - determine x speed;
        I.xVelocity = I.xSpeed;
        I.yVelocity = -I.ySpeed;
        I.width = 3;
        I.height = 3;
        I.color = "#000";

        I.inBounds = function() {
            return I.x >= 0 && I.x <= CANVAS_WIDTH &&
                I.y >= 0 && I.y <= CANVAS_HEIGHT;
        };

        I.draw = function() {
            c.fillStyle = this.color;
            c.fillRect(this.x, this.y, this.width, this.height);
        };

        I.update = function() {
            I.x += I.xVelocity;
            I.y += I.yVelocity;
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
		
		I.color = "#FF0000";
		
		I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH/2;
		I.y = 0;
		I.xVelocity = 0;
		I.yVelocity = 5;
		
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
			this.active = false;
		};
		I.update = function(){
			I.x+= I.xVelocity;
			I.y+= I.yVelocity;
			I.xVelocity = 3* Math.sin(I.age * Math.PI/64);
			I.age++;
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
        
        if(keydown.left){
            player.x -=5;
        }
        
        if(keydown.right){
            player.x +=5;   
        }
        
        player.x = player.x.clamp(0, CANVAS_WIDTH - player.width);
        
        playerBullets.forEach(function(bullet) {
            bullet.update();
        });

        playerBullets = playerBullets.filter(function(bullet) {
            return bullet.active;
        });
		
		enemies.forEach(function(enemy){
			enemy.update();
		});
		
		enemies = enemies.filter(function(enemy){
			return enemy.active;
		});
		
		if(Math.random() >0.95){
			enemies.push(Enemy());
		}
		
		handleCollisions();
		
    };
        
    function draw(){
        canvas.width = canvas.width;
        player.draw();
		scoreboard.draw();
		player.drawTurret();
        playerBullets.forEach(function(bullet) {
            bullet.draw();
        });
		enemies.forEach(function(enemy){
			enemy.draw();
		});
    }
    
    player.shoot= function(){
        var bulletPosition = this.midpoint();
		var y = Math.abs(bulletPosition.y-(this.height/2)-mouseY),
		x = Math.abs(bulletPosition.x - mouseX),
		distance = Math.sqrt(y*y+x*x),
		theta = Math.atan2(y,x);
		var Vz = distance/10;
		var Vy = Vz * Math.sin(theta);
		var Vx = Vz * Math.cos(theta);
		if(mouseX >= bulletPosition.x){
			Vx = Vx;
		}else{
			Vx = -Vx;
		}
        playerBullets.push(Bullet({
            xSpeed: Vx,
			ySpeed: Vy,
            x: bulletPosition.x,
            y: bulletPosition.y - this.height/2
        }));   
    }
    player.midpoint = function() {
        return {
            x: this.x + this.width/2,
            y: this.y + this.height/2
        };
    };  

    
    //Game Loop
    
    var FPS = 30;
    function start_game(){
		refreshIntervalId = setInterval(function(){
			update();
			draw();
			if(scoreboard.gameover == 1){
				c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				c.fillStyle = "blue";
				c.font ="50px Georgia";
				c.textAlign = "center";
				c.fillText("Game Over!",CANVAS_WIDTH/2,CANVAS_HEIGHT/2);
				c.fillStyle = "green";
				c.font = "25px Calibri";
				c.fillText("Score: "+scoreboard.score,CANVAS_WIDTH/2,CANVAS_HEIGHT/2+40);
				btn.prop("disabled",false);
				btn.html("Play Again");
				if(scoreboard.score>scoreboard.highscore){
					scoreboard.highscore = scoreboard.score;
				}
			}
		},1000/FPS);
	}
	
	btn.click(function(){
		if(scoreboard.gameover == 0){
			btn.prop("disabled",true);
			start_game();
		}else{
			scoreboard.gameover = 0;
			scoreboard.score = 0;
			enemies = [];
			playerBullets = [];
			btn.prop("disabled",true);
			start_game();
		}
	});
	
});
