$(document).ready(function() {

	var date = new Date();

	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();

	//Lets save the cell width in a variable for easy control
	var tw = 30,
		bw = 40;
	var th = 40,
		bh = 10;
	var lw = 5,
		lh = 5;
	var cw = w / 2,
		ch = h - th;
	var sx = cw,
		sy = ch;

	//Define the mouseenter and move function

	var mouseX;
	var mouseY;
	$(document).mousemove(function(e) {
		mouseX = e.pageX;
		mouseY = e.pageY;
	});

	//Lets paint the canvas now
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, w, h);
	ctx.strokeStyle = "black";
	ctx.strokeRect(0, 0, w, h);

	//Create the dome


	function paint() {
		canvas.width = canvas.width;

		ctx.beginPath();
		ctx.arc(sx, sy, 5, 0, 2 * Math.PI);
		ctx.strokeStyle = "black";
		ctx.fillStyle = "black";
		ctx.stroke();
		ctx.fill();

		drawTurret();
		//Create the tower
		ctx.fillStyle = "#EE4000";
		ctx.fillRect((w - tw) / 2, h - th, tw, th);

		//Create the tower base
		ctx.fillStyle = "#B0171F";
		ctx.fillRect((w - bw) / 2, h - bh, bw, bh);



	}
	canvas.addEventListener("mouseDown", shoot, false);

	function shoot() {
		var targetX = mouseX,
			targetY = mouseY,
			start_time = d.getMilliseconds();
		
		//Calculate angle
		var y = Math.abs(ch - targetY),
			x = Math.abs(targetX - cw);
		var theta = Math.atan2(y, x);
		
		
		

	}
	
	function getLineXYatPercent(startPt,endPt,percent) {
		var dx = endPt.x-startPt.x;
		var dy = endPt.y-startPt.y;
		var X = startPt.x + dx*percent;
		var Y = startPt.y + dy*percent;
		return( {x:X,y:Y} );
	}

	function drawTurret() {
		if (mouseY <= ch) {
			ctx.beginPath();
			ctx.moveTo(cw, ch);
			ctx.lineTo(mouseX, mouseY);
			ctx.strokeStyle = "silver";
			ctx.stroke();

			//Calculate angle
			var y = Math.abs(ch - mouseY),
				x = Math.abs(mouseX - cw);
			var theta = Math.atan2(y, x);
			//res *= 180/Math.PI;
			var dX = 20 * Math.cos(theta);
			var dY = 20 * Math.sin(theta);
			var newY = ch - dY,
				newX = 0;
			if (mouseX >= (w / 2)) {
				newX = cw + dX;
			} else {
				newX = cw - dX;
			}
			//Draw turret with 20px
			ctx.beginPath();
			ctx.moveTo(cw, ch);
			ctx.lineWidth = 10;
			ctx.lineCap = "round";
			ctx.lineTo(newX, newY);
			ctx.strokeStyle = "#458B00";
			ctx.stroke();
		} else {
			ctx.moveTo(cw, ch);
			ctx.lineTo(mouseX, ch);
			ctx.strokeStyle = "silver";
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(cw, ch);
			ctx.lineWidth = 10;
			ctx.lineCap = "round";
			if (mouseX >= cw) {
				ctx.lineTo(cw + 20, ch);
			} else {
				ctx.lineTo(cw - 20, ch);
			}
			ctx.strokeStyle = "#458B00";
			ctx.stroke();
		}

		//Draw Cross-hairs
		ctx.beginPath();
		ctx.moveTo(mouseX - 5, mouseY);
		ctx.lineTo(mouseX + 5, mouseY);
		ctx.moveTo(mouseX, mouseY + 5);
		ctx.lineTo(mouseX, mouseY - 5);
		ctx.strokeStyle = "silver";
		ctx.lineWidth = 1;
		ctx.stroke();

	}
	game_loop = setInterval(paint, 60);
});