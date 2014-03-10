$(document).ready(function(){
    
    var canvas = $("#canvas")[0];
    var c = canvas.getContext("2d");
    var CANVAS_WIDTH = 450, CANVAS_HEIGHT= 450;
    var textX = 50;
    var textY= 50;
        
    var player = {
        color:"#000",
        width:32,
        height:32,
        x:CANVAS_WIDTH/2,
        y:250,
        draw:function(){
            c.fillStyle = this.color;
            c.fillRect(this.x,this.y, this.width, this.height);
        }
    };
    
    $("#wrapper").click(function(){
        player.shoot();    
    });
    
    var playerBullets = [];
    function Bullet(I) {
        I.active = true;

        I.xVelocity = 0;
        I.yVelocity = -I.speed;
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
    
    function update(){
        if(keydown.space){
            player.shoot();    
        }
        
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
    }
        
    function draw(){
        canvas.width = canvas.width;
        player.draw();
        playerBullets.forEach(function(bullet) {
            bullet.draw();
        });
    }
    
    player.shoot= function(){
        var bulletPosition = this.midpoint();
        playerBullets.push(Bullet({
            speed: 15,
            x: bulletPosition.x,
            y: bulletPosition.y
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
    setInterval(function(){
        update();
        draw();
    },1000/FPS);
});
