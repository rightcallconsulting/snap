/*
length: 360 feet (120 yards)
width: 160 feet (53.33 yards)
endzone: 30 feet (10 yards)
left hash: 60 feet in, 2 feet wide (starts at 59 feet)
right hash: 100 feet, 2 feet wide (starts at 61 feet)
secondary hashes: 2 feet wide, 1 foot from sideline?
numbers: 6 feet high, 4 feet wide, top of numbers are 9 yards (27 feet) from sideline

*/

var FieldNumber = function(config){
  this.num = config.num || 50,
  this.x1 = config.x1 || 0,
  this.y1 = config.y1 || 0,
  this.x2 = config.x2 || 0,
  this.y2 = config.y2 || 0
};

FieldNumber.prototype.draw = function(){

};

var Field = function(config){

  this.heightInYards = config.heightInYards || 30;
  this.height = config.height || 400;
  this.width = config.width || 400;
  this.typeField = config.typeField || null;
  this.ballYardLine = config.yardLine || 50;
  this.ballWidthOffset = config.widthOffset || 0;   //not using yet, but allows ball on a hash
  this.coverageZones = config.coverageZones || [];
};


Field.LENGTH = 120;
Field.WIDTH = 53.33;

var field = new Field({
  heightInYards: 40,
  yardLine: 75
});


var createPlayField = new Field({
  heightInYards: 40,
  typeField: "Create"
});



Field.prototype.getWidthInYards = function(){
  return this.heightInYards;// * (width / height);
}

Field.prototype.getTranslatedX = function(x){
  return this.yardsToPixels(x - this.getXOffset());
}

Field.prototype.getTranslatedY = function(y){
  return this.height - this.yardsToPixels(y - this.getYOffset());
}

Field.prototype.getYardX = function(x){
  return this.pixelsToYards(x)+this.getXOffset();
}

Field.prototype.getYardY = function(y){
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


Field.prototype.drawBackground = function(play, height, width) {
  angleMode(RADIANS);
  var pixelsToYards = this.heightInYards / height;
  var yardsToPixels = height / this.heightInYards;
  background(93, 148, 81);
  stroke(255, 255, 255);
  line(this.getTranslatedX(0), this.getTranslatedY(-10), this.getTranslatedX(0), this.getTranslatedY(110));
  line(this.getTranslatedX(Field.WIDTH), this.getTranslatedY(-10), this.getTranslatedX(Field.WIDTH), this.getTranslatedY(110));
  debugger;
  for(var i = 0; i < this.heightInYards; i++){
    var currentYardLine = (this.ballYardLine + i - this.heightInYards/2).toFixed();
    var yc = height - height * (i/this.heightInYards);
    stroke(255, 255, 255);
    if(currentYardLine <= 0 || currentYardLine >= 100){
      currentYardLine = min(currentYardLine, 100 - currentYardLine).toFixed();
      if(currentYardLine === (-10).toFixed() || currentYardLine === (0).toFixed()){
        line(this.getTranslatedX(0), yc, this.getTranslatedX(Field.WIDTH), yc);
      }else{

      }
    }
    else if(currentYardLine % 10 === 0){
      line(this.getTranslatedX(0), yc, this.getTranslatedX(Field.WIDTH), yc);
      textAlign(CENTER);
      rotate(HALF_PI);
      fill(255,255,255);
            textSize(26); //the one thing that isn't adjusting for screen size...

            //debugger;
            text(min(currentYardLine,100-currentYardLine), yc, (this.getXOffset()-9)*yardsToPixels);
            rotate(PI);
            var xc = (53.33 - 9)*yardsToPixels;
            //debugger;
            text(min(currentYardLine,100-currentYardLine), 0-yc, (44.33-this.getXOffset())*yardsToPixels);
            //rotate(HALF_PI);
            resetMatrix();
          }else if(currentYardLine % 5 === 0){
            line(this.getTranslatedX(0), yc, this.getTranslatedX(Field.WIDTH), yc);
          }else{
            line(this.getTranslatedX(0), yc, this.getTranslatedX(1), yc);
            line((19.67-this.getXOffset())*yardsToPixels, yc, (20.33 - this.getXOffset())*yardsToPixels, yc);
            line((33 - this.getXOffset())*yardsToPixels, yc, (33.67 - this.getXOffset())*yardsToPixels, yc);
            line(this.getTranslatedX(Field.WIDTH - 1), yc, this.getTranslatedX(Field.WIDTH), yc);
          }
        }
      };
