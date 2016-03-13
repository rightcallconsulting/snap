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
  return this.heightInYards * (width / height);
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

//// CREATING FIELD ZONES FOR PASS COVERAGE ////

Field.prototype.getFlat = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - 26.65;
    var yCoord = ballY;

  }else if(strength === 1){
    var xCoord = ballX + 21.335;
    var yCoord = ballY;
  }
  return [xCoord, yCoord, 5.333, 5];
};

Field.prototype.getHook = function(ballX, ballY, strength){
  if(strength === 0){
    // STRONG HOOK ZONE
    var xCoord = ballX - 16;
    var yCoord = ballY - 5;

  } else if(strength === 1){
    // WEAK HOOK ZONE
    var xCoord = ballX - 16;
    var yCoord = ballY - 5;
  } 
  return [xCoord, yCoord, 10.666, 10];
};

Field.prototype.getHole = function(ballX, ballY){
  var xCoord = ballX - (5.333);
  var yCoord = ballY;
  return [xCoord, yCoord, 10.666, 10];
};

Field.prototype.drawZones = function(){ 
  
  fill(220, 220, 0);
  rect(170, 5, 60, 10);
};

/*
Player.prototype.drawGapAssignments = function(test) {
  var x = field.getTranslatedX(this.x);
  var y = field.getTranslatedY(this.y);
  var siz = field.yardsToPixels(this.siz);
  stroke(255, 0, 0);
  line(x, y, field.getTranslatedX(this.gapXPoint), field.getTranslatedY(this.gapYPoint));
  fill(255, 0, 0);
  noFill()
  ellipse(field.getTranslatedX(this.gapXPoint), field.getTranslatedY(this.gapYPoint), 10, 10);
};
*/
//

Field.prototype.drawBackground = function(play, height, width) {
  angleMode(RADIANS);
  var pixelsToYards = this.heightInYards / height;
  var yardsToPixels = height / this.heightInYards;
  background(93, 148, 81);
  for(var i = 0; i < this.heightInYards; i++){
    var currentYardLine = (field.ballYardLine + i - this.heightInYards/2).toFixed();
    var yc = height - height * (i/this.heightInYards);
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
            text(min(currentYardLine,100-currentYardLine), yc, (this.getXOffset()-9)*yardsToPixels);
            rotate(PI);
            var xc = (53.33 - 9)*yardsToPixels;
            //debugger;
            text(min(currentYardLine,100-currentYardLine), 0-yc, (44.33-this.getXOffset())*yardsToPixels);
            //rotate(HALF_PI);
            resetMatrix();
          }else if(currentYardLine % 5 === 0){
            line(0, yc, width, yc);
          }else{
            line((0.33 - this.getXOffset())*yardsToPixels, yc, (1 - this.getXOffset())*yardsToPixels, yc);
            line((19.67-this.getXOffset())*yardsToPixels, yc, (20.33 - this.getXOffset())*yardsToPixels, yc);
            line((33 - this.getXOffset())*yardsToPixels, yc, (33.67 - this.getXOffset())*yardsToPixels, yc);
            line((52.33)*yardsToPixels, yc, (53)*yardsToPixels, yc);
          }
        }
      };
