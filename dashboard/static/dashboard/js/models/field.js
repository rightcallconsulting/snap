/*
length: 360 feet (120 yards)
width: 160 feet (53.33 yards)
endzone: 30 feet (10 yards)
left hash: 60 feet in, 2 feet wide (starts at 59 feet)
right hash: 100 feet, 2 feet wide (starts at 61 feet)
secondary hashes: 2 feet wide, 1 foot from sideline?
numbers: 6 feet high, 4 feet wide, top of numbers are 9 yards (27 feet) from sideline
*/

var Field = function(config){
	this.heightInYards = config.heightInYards || 30;
	this.height = config.height || 400;
	this.width = config.width || 400;
	this.typeField = config.typeField || null;
	this.ballYardLine = config.yardLine || 50;
	this.ballWidthOffset = config.widthOffset || 0;   //not using yet, but allows ball on a hash
	this.coverageZones = config.coverageZones || [];
};

// Globals
Field.LENGTH = 120;
Field.WIDTH = 53.33;
Field.leftHashYardX = 20;
Field.rightHashYardX = 33.33;

var field = new Field({
	heightInYards: 40,
	yardLine: 75
});

var createPlayField = new Field({
	heightInYards: 40,
	typeField: "Create"
});

Field.prototype.getOffensivePlayerTextSize = function(){
	return 11 * (40 / this.heightInYards) ;
}

Field.prototype.getDefensivePlayerTextSize = function(){
	return 14 * (40 / this.heightInYards) ;
}

Field.prototype.setFieldType = function(field_type){
	this.typeField = field_type;
	this.updateStaticConstantsForFieldType();
}

Field.prototype.updateStaticConstantsForFieldType = function(){
	if(this.typeField === "HS"){
		Field.leftHashYardX = 17.78
		Field.rightHashYardX = 35.56
	} else if(this.typeField === "NCAA"){
		Field.leftHashYardX = 20
		Field.rightHashYardX = 33.33
	} else if(this.typeField === "NFL"){
		Field.leftHashYardX = 23.58
		Field.rightHashYardX = 29.75
	}
}

Field.prototype.getViewPoint = function(){
	return this.viewPoint;
}

Field.prototype.getViewDirection = function(){
	if (this.viewPoint == "offense"){
		return 1;
	}
	return -1;
}

Field.prototype.flipView = function(){
	if(this.viewPoint === "offense"){
		this.viewPoint = "defense";
	}else{
		this.viewPoint = "offense";
	}
}

Field.prototype.getWidthInYards = function(){
	return this.heightInYards;// * (width / height);
}

Field.prototype.getTranslatedX = function(x){

	if(this.viewPoint === "defense"){
		return this.yardsToPixels((Field.WIDTH - x) - this.getXOffset()) + (this.width - this.height)/2
	}
	return this.yardsToPixels(x - this.getXOffset()) + (this.width - this.height)/2;
}

Field.prototype.getTranslatedY = function(y){
	if(this.viewPoint === "defense"){
		var yDiffFromLOS = y - this.ballYardLine;
		return this.height/2 + this.yardsToPixels(yDiffFromLOS);
	}
	return this.height - this.yardsToPixels(y - this.getYOffset());
}

Field.prototype.getYardX = function(x){
	if(this.viewPoint === "defense"){
		return Field.WIDTH - (this.pixelsToYards(x - (this.width - this.height)/2)+this.getXOffset());
	}
	return this.pixelsToYards(x - (this.width - this.height)/2)+this.getXOffset();
}

Field.prototype.getYardY = function(y){
	if(this.viewPoint === "defense"){
		var yDiffFromLOS = y - this.height/2;
		return this.ballYardLine + this.pixelsToYards(yDiffFromLOS);
	}
	return this.ballYardLine + this.heightInYards/2 - this.pixelsToYards(y);
}

Field.prototype.translateCoords = function(yardCoords){
	return [this.getTranslatedX(yardCoords[0]), this.getTranslatedY(yardCoords[1])];
}

Field.prototype.pixelsToYards = function(pixels){
	return pixels * this.heightInYards / this.height;
}

Field.prototype.yardsToPixels = function(yards){
	return yards * this.height / (this.heightInYards);
}

Field.prototype.getXOffset = function(){
	return (Field.WIDTH - this.getWidthInYards())/2; //doesn't have capability for non-centered fields yet
}

Field.prototype.getYOffset = function(){
	return this.ballYardLine - this.heightInYards/2;
}

Field.prototype.isClickInsideField = function(){
	if(mouseX < 0 || mouseX > this.width || mouseY < 0 || mouseY > this.height){
		return false;
	}
	var mouseYardX = this.getYardX(mouseX);
	var mouseYardY = this.getYardY(mouseY);
	if(mouseYardX < 0 || mouseYardX > Field.WIDTH || mouseYardY < -10 || mouseYardY > 110){
		return false;
	}
	return true;
}


Field.prototype.drawBackground = function(play, height, width) {
	angleMode(RADIANS);
	var sideline_weight = 20;
	var yardline_weight = 1;
	var dash_weigth = 1;

	var pixelsToYards = this.heightInYards / height;
	var yardsToPixels = height / this.heightInYards;
	noStroke();
	background(Colors.fieldColor());
	stroke(Colors.whiteColor());

	// Sidelines
	strokeWeight(sideline_weight);
	line(this.getTranslatedX(0)-sideline_weight*this.getViewDirection()/2, this.getTranslatedY(-10), this.getTranslatedX(0)-sideline_weight*this.getViewDirection()/2, this.getTranslatedY(110));
	line(this.getTranslatedX(Field.WIDTH)+sideline_weight*this.getViewDirection()/2, this.getTranslatedY(-10), this.getTranslatedX(Field.WIDTH)+sideline_weight*this.getViewDirection()/2, this.getTranslatedY(110));

	strokeWeight(yardline_weight);

	for(var i = 0; i < this.heightInYards; i++) {
		var currentYardLine = (this.ballYardLine + this.getViewDirection()*(i - this.heightInYards/2)).toFixed();
		var yc = height - height * (i/this.heightInYards);
		stroke(Colors.whiteColor());

		if(currentYardLine <= 0 || currentYardLine >= 100) {
			currentYardLine = min(currentYardLine, 100 - currentYardLine).toFixed();
			if(currentYardLine === (-10).toFixed() || currentYardLine === (0).toFixed()) {
				line(this.getTranslatedX(0), yc, this.getTranslatedX(Field.WIDTH), yc);
			} else { }
		} else if(currentYardLine % 10 === 0) {
			line(this.getTranslatedX(0), yc, this.getTranslatedX(Field.WIDTH), yc);
			textAlign(CENTER);
			rotate(HALF_PI);
			fill(Colors.whiteColor());
			textSize(30 * Field.WIDTH / this.getWidthInYards()); //the one thing that isn't adjusting well for screen size...
			text(min(currentYardLine,100-currentYardLine), yc, (this.getXOffset()-9)*yardsToPixels - (this.width-this.height)/2);
			//text(min(currentYardLine,100-currentYardLine), yc, this.getTranslatedX(9));
			rotate(PI);
			var xc = (53.33 - 9)*yardsToPixels;
			text(min(currentYardLine,100-currentYardLine), 0-yc, (44.33-this.getXOffset())*yardsToPixels + (this.width-this.height)/2);
			//rotate(HALF_PI);
			resetMatrix();
		} else if(currentYardLine % 5 === 0) {
			line(this.getTranslatedX(0), yc, this.getTranslatedX(Field.WIDTH), yc);
		} else {
			line(this.getTranslatedX(0), yc, this.getTranslatedX(1), yc);
			line((Field.leftHashYardX - 0.33 -this.getXOffset())*yardsToPixels + (this.width-this.height)/2, yc, (Field.leftHashYardX + 0.33  - this.getXOffset())*yardsToPixels + (this.width-this.height)/2, yc);
			line((Field.rightHashYardX - 0.33 - this.getXOffset())*yardsToPixels + (this.width-this.height)/2, yc, (Field.rightHashYardX + 0.33 - this.getXOffset())*yardsToPixels + (this.width-this.height)/2, yc);
			line(this.getTranslatedX(Field.WIDTH - 1), yc, this.getTranslatedX(Field.WIDTH), yc);
		}
	}

	noStroke();
};
