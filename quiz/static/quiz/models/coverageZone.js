CoverageZone = function(config){
	this.x = config.x || 50;
	this.y = config.y || 50;
	this.width = config.width || 10;
	this.height = config.height || 10;
	this.fill = config.fill || color(0, 0, 0);
	this.clicked = config.clicked || false;
	this.name = config.name || "";
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
		fill(255, 204, 0);
	}
	rect(pixels[0], pixels[1], pixels[2], pixels[3]);
	fill(255, 255, 255);
	if(this.clicked){
		fill(0);
	}
	textAlign(CENTER, CENTER);
	text(this.name, pixels[0], pixels[1], pixels[2], pixels[3]);

};

CoverageZone.prototype.isMouseInside = function(mouseX, mouseY){
	return mouseX > (this.x) &&
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
		name: "DEEP",
		x: 0.01,
		y: ballY + 26.666,
		width: 26.666,
		height: 15,
		fill: color(85, 190, 230)
	});
	var rightDeep = new CoverageZone({
		name: "DEEP",
		x: ballX,
		y: ballY + 26.666,
		width: 26.666,
		height: 15,
		fill: color(85, 190, 230)
	});
	this.zones.push(leftDeep);
	this.zones.push(rightDeep);

	var hole = new CoverageZone({
		name: "HOLE",
		x: Field.WIDTH/2 - 5.333,
		y: ballY + 11.5,
		width: 10.666,
		height: 9,
		fill: color(100, 100, 100)
	});
	this.zones.push(hole);

	var leftHook = new CoverageZone({
		name: "HOOK",
		x: 10.666,
		y: ballY + 11.5,
		width: 10.666,
		height: 9,
		fill: color(255, 100, 135)
	});
	var rightHook = new CoverageZone({
		name: "HOOK",
		x: 32,
		y: ballY + 11.5,
		width: 10.666,
		height: 9,
		fill: color(255, 100, 135)
	});
	this.zones.push(leftHook);
	this.zones.push(rightHook);

	

	

	var leftCurl = new CoverageZone({
		name: "CURL",
		x: ballX - 21.333,
		y: ballY + 11.5,
		width: 5.333,
		height: 5,
		fill: color(100, 0, 100)
	});
	var rightCurl = new CoverageZone({
		name: "CURL",
		x: Field.WIDTH/2 + 16,
		y: ballY + 11.5,
		width: 5.333,
		height: 5,
		fill: color(100, 0, 100)
	});
	this.zones.push(leftCurl);
	this.zones.push(rightCurl);

	var leftOut = new CoverageZone({
		name: "OUT",
		x: 0.01,
		y: ballY + 11.5,
		width: 5.333,
		height: 5,
		fill: color(204, 0, 0)
	});
	var rightOut = new CoverageZone({
		name: "OUT",
		x: Field.WIDTH - 5.333, 
		y: ballY + 11.5,
		width: 5.333,
		height: 5,
		fill: color(204, 0, 0)
	});
	this.zones.push(leftOut);
	this.zones.push(rightOut);

	var leftStop = new CoverageZone({
		name: "STOP",
		x: ballX - 21.333,
		y: ballY + 6.5,
		width: 5.333,
		height: 5,
		fill: color(255, 102, 0)
	});

	var rightStop = new CoverageZone({
		name: "STOP",
		x: Field.WIDTH - 10.666,
		y: ballY + 6.5,
		width: 5.333,
		height: 5,
		fill: color(255, 102, 0)
	});
	this.zones.push(leftStop);
	this.zones.push(rightStop);

	var leftFlat = new CoverageZone({
		name: "FLAT",
		x: 0.01,
		y: ballY + 6.5,
		width: 5.333,
		height: 5,
		fill: color(220, 220, 0)
	});
	var rightFlat = new CoverageZone({
		name: "FLAT",
		x: Field.WIDTH - 5.333,
		y: ballY + 6.5,
		width: 5.333,
		height: 5,
		fill: color(220, 220, 0)
	});
	this.zones.push(leftFlat);
	this.zones.push(rightFlat);

	var leftFade = new CoverageZone({
		name: "FADE",
		x: 0.01,
		y: ballY + 18.333,
		width: 6,
		height: 6.666,
		fill: color(215, 150, 25)
	});

	var rightFade = new CoverageZone({
		name: "FADE",
		x: 47.333,
		y: ballY + 18.333,
		width: 6,
		height: 6.666,
		fill: color(215, 150, 25)
	});
	this.zones.push(leftFade);
	this.zones.push(rightFade);
	debugger;

};