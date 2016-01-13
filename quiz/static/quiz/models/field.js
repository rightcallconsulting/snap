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
    this.widthInYards = config.widthInYards || 30;
    this.typeField = config.typeField || null;
    this.ballYardLine = config.yardLine || 50;
    this.ballWidthOffset = config.widthOffset || 0; //not using yet, but allows ball on a hash
};

var field = new Field({
  heightInYards: 40,
  widthInYards: 40,
  yardLine: 95,
  widthOffset: -3
});

var createPlayField = new Field({
  heightInYards: 50,
  widthInYards: 50,
  typeField: "Create"
});


Field.prototype.drawBackground = function(play, height, width) {
  angleMode(RADIANS);
  var xOffset = (53.33 - this.widthInYards) / 2;
  var pixelsToYards = this.heightInYards / height;
  var yardsToPixels = height / this.heightInYards;
    background(93, 148, 81);
    for(var i = 0; i < this.heightInYards; i++){
      var currentYardLine = (field.ballYardLine + i - this.heightInYards/2).toFixed();
        var yc = height * (i/this.heightInYards);
        stroke(255, 255, 255);
        if(currentYardLine <= 0 || currentYardLine >= 100){
          currentYardLine = min(currentYardLine, 100 - currentYardLine).toFixed();
            if(currentYardLine === (-10).toFixed() || currentYardLine === (0).toFixed()){
              line(0, yc, width, yc);
            }else{

            }
        }
        else if(currentYardLine % 10 === 0){
            line(0, yc, width, yc);
            textAlign(CENTER);
            rotate(HALF_PI);
            fill(255,255,255);
            textSize(26); //the one thing that isn't adjusting for screen size...

            //debugger;
            text(min(currentYardLine,100-currentYardLine), yc, (xOffset-9)*yardsToPixels);
            rotate(PI);
            var xc = (53.33 - 9)*yardsToPixels;
            //debugger;
            text(min(currentYardLine,100-currentYardLine), 0-yc, (44.33-xOffset)*yardsToPixels);
            //rotate(HALF_PI);
            resetMatrix();
        }else if(currentYardLine % 5 === 0){
            line(0, yc, width, yc);
        }else{
            line((0.33 - xOffset)*yardsToPixels, yc, (1 - xOffset)*yardsToPixels, yc);
            line((19.67-xOffset)*yardsToPixels, yc, (20.33 - xOffset)*yardsToPixels, yc);
            line((33 - xOffset)*yardsToPixels, yc, (33.67 - xOffset)*yardsToPixels, yc);
            line((52.33)*yardsToPixels, yc, (53)*yardsToPixels, yc);
        }
    }
    textSize(18);
    textAlign(LEFT);
    if(play && !play.newPlay){
      fill(255,255,255)
      text(play.playName,10,23);
    }
    else if(this.typeField == "Create"){
      text("Play: "+ play.playName, 10, 53);
    }
};
