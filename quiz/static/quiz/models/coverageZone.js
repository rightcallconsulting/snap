CoverageZone = function(config){
	this.x = config.x || 50;
	this.y = config.y || 50;
	this.width = config.width || 10;
	this.height = config.height || 10;
	this.fill = config.fill || color(0, 0, 0);
	this.clicked = config.clicked || false;
};

CoverageZone.prototype.getPixelZone = function(field){
	var pixelZone = [0.0, 0.0, 0.0, 0.0];
	pixelZone[0] = field.getTranslatedX(this.x);
	pixelZone[1] = field.getTranslatedY(this.y);
	pixelZone[2] = field.yardsToPixels(this.width);
	pixelZone[3] = field.yardsToPixels(this.height);
	return pixelZone;
};

CoverageZone.prototype.draw = function(field){
	var pixels = this.getPixelZone(field);
	fill(this.fill);
	if(this.clicked){
		fill(220, 220, 0);
	}
	rect(pixels[0], pixels[1], pixels[2], pixels[3]);
};

CoverageZone.prototype.isMouseInside = function(mouseX, mouseY){
	return mouseX > this.x &&
           mouseX < (this.x + this.width) &&
           mouseY > (this.y - this.height) &&
           mouseY < (this.y);
};

CoverageMap = function(config){
	this.name = config.name || "";
	this.zones = config.zones || [];
};

CoverageMap.prototype.draw = function(field){
	for(var i = 0; i < this.zones.length; i++){
		var zone = this.zones[i];
		zone.draw(field);
	}
};

CoverageMap.prototype.getClickedZone = function(mouseX, mouseY){
	for(var i = 0; i < this.zones.length; i++){
		var zone = this.zones[this.zones.length - i - 1];
		if(zone.isMouseInside(mouseX, mouseY)){
			return zone;
		}
	}
	return null;
};

CoverageMap.prototype.clearClicks = function(){
	for(var i = 0; i < this.zones.length; i++){
		var zone = this.zones[i];
		zone.clicked = false;
	}
};

CoverageMap.prototype.fillTwoDeepZone = function(field){
	var ballX = Field.WIDTH / 2;
	var ballY = field.ballYardLine;

	var leftDeep = new CoverageZone({
		x: 0.01,
		y: ballY + 26.666,
		width: 26.666,
		height: 25,
		fill: color(85, 190, 230)
	});

	var rightDeep = new CoverageZone({
		x: ballX,
		y: ballY + 26.666,
		width: 26.666,
		height: 25,
		fill: color(85, 190, 230)
	});
	this.zones.push(leftDeep);
	this.zones.push(rightDeep);

	var leftOut = new CoverageZone({
		x: 0.01,
		y: ballY + 11.5,
		width: 5.333,
		height: 5,
		fill: color(220, 80, 230)
	});
	var rightOut = new CoverageZone({
		x: Field.WIDTH - 5.333, 
		y: ballY + 11.5,
		width: 5.333,
		height: 5,
		fill: color(220, 80, 230)
	});
	this.zones.push(leftOut);
	this.zones.push(rightOut);

	var leftFlat = new CoverageZone({
		x: 0.01,
		y: ballY + 6.5,
		width: 5.333,
		height: 5,
		fill: color(220, 220, 0)
	});
	var rightFlat = new CoverageZone({
		x: Field.WIDTH - 5.333,
		y: ballY + 6.5,
		width: 5.333,
		height: 5,
		fill: color(220, 220, 0)
	});
	this.zones.push(leftFlat);
	this.zones.push(rightFlat);

	var leftCurl = new CoverageZone({
		x: Field.WIDTH - 21.333,
		y: ballY + 11.5,
		width: 5.333,
		height: 5,
		fill: color(0, 0, 0)
	});
	var rightCurl = new CoverageZone({
		x: Field.WIDTH + 16,
		y: ballY + 11.5,
		width: 5.333,
		height: 5,
		fill: color(0, 0, 0)
	});
	this.zones.push(leftCurl);
	this.zones.push(rightCurl);

	var leftStop = new CoverageZone({
		x: 5.333,
		y: ballY + 6.5,
		width: 5.333,
		height: 5,
		fill: color(255)
	});

	var rightStop = new CoverageZone({
		x: 41.666,
		y: ballY + 6.5,
		width: 5.333,
		height: 5,
		fill: color(85, 230, 100)
	});
	this.zones.push(leftStop);
	this.zones.push(rightStop);

	var leftHook = new CoverageZone({
		x: 10.666,
		y: ballY + 11.5,
		width: 10.666,
		height: 9,
		fill: color(255, 100, 135)
	});
	var rightHook = new CoverageZone({
		x: 32,
		y: ballY + 11.5,
		width: 10.666,
		height: 9,
		fill: color(255, 100, 135)
	});
	this.zones.push(leftHook);
	this.zones.push(rightHook);

	var hole = new CoverageZone({
		x: -5.333,
		y: ballY + 11,
		width: 11,
		height: 9,
		fill: color(108, 190, 130)
	});
	this.zones.push(hole);

	var leftFade = new CoverageZone({
		x: 0.01,
		y: ballY + 5.5,
		width: 6,
		height: 5,
		fill: color(215, 150, 25)
	});

	var rightFade = new CoverageZone({
		x: 48,
		y: ballY + 5.5,
		width: 6,
		height: 5,
		fill: color(215, 150, 25)
	});
	this.zones.push(leftFade);
	this.zones.push(rightFade);

};