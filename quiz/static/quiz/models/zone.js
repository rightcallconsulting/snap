/*var CoverageZone = function(config){
  this.smallZoneX1 = 26.666;
  this.smallZoneX2 = 21.333;
  this.smallZoneY1 = 11.5;
  this.smallZoneY2 = 6.5;
  this.smallWidth = 5.333;
  this.smallHeight = 5;
  this.medZoneX1 = 16.333;
  this.largeZoneY1 = 13.333;
};

CoverageZone.prototype.getOuts = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - this.smallZoneX1;
    var yCoord = ballY + this.smallZoneY1;
  }else if(strength === 1){
    var xCoord = ballX + this.smallZoneX2;
    var yCoord = ballY + this.smallZoneY1;
  }
  return [xCoord, yCoord, this.smallWidth, this.smallHeight];
};

CoverageZone.prototype.getFlats = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - this.smallZoneX1;
    var yCoord = ballY + this.smallZoneY2;
  }else if (strength === 1) {
    var xCoord = ballX + this.smallZoneX2;
    var yCoord = ballY + this.smallZoneY2;
  }
  return [xCoord, yCoord, this.smallWidth, this.smallHeight];
};

CoverageZone.prototype.getCurls = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - this.smallZoneX2;
    var yCoord = ballY + this.smallZoneY1;
  }else if(strength === 1){
    var xCoord = ballX + this.medZoneX1;
    var yCoord = ballY + this.smallZoneY1;
  }
  return [xCoord, yCoord, this.smallWidth, this.smallHeight];
};

CoverageZone.prototype.getStops = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - this.smallZoneX2;
    var yCoord = ballY + this.smallZoneY2;
  }else if (strength === 1) {
    var xCoord = ballX + this.medZoneX1;
    var yCoord = ballY + this.smallZoneY2;
  }
  return [xCoord, yCoord, this.smallWidth, this.smallHeight];
};

CoverageZone.prototype.getHooks = function(ballX, ballY, strength){
  if(strength === 0){
    // STRONG HOOK ZONE
    var xCoord = ballX - this.medZoneX1;
    var yCoord = ballY + 11;
  } else if(strength === 1){
    // WEAK HOOK ZONE
    var xCoord = ballX + 5.666;
    var yCoord = ballY + 11;
  } 
  return [xCoord, yCoord, 10.666, 9];
};

CoverageZone.prototype.getHole = function(ballX, ballY){
  var xCoord = ballX - 5.334;
  var yCoord = ballY + 11;
  return [xCoord, yCoord, 11, 9];
};
CoverageZone.prototype.getDeeps = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - this.smallZoneX1;
    var yCoord = ballY + this.smallZoneX1;
  } else if(strength === 1){
    // WEAK HOOK ZONE
    var xCoord = ballX;
    var yCoord = ballY + this.smallZoneX1;
  } 
  return [xCoord, yCoord, ballX, 15.333];
};

CoverageZone.prototype.getFades = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - this.smallZoneX1;
    var yCoord = ballY + this.largeZoneY1;
  } else if(strength === 1){
    var xCoord = ballX + 19.333;
    var yCoord = ballY + this.largeZoneY1;
  } 
  return [xCoord, yCoord, 5.666, 7.666];
};

CoverageZone.prototype.getPixelZone = function(zone){
  var pixelZone = [0.0, 0.0, 0.0, 0.0];
  pixelZone[0] = field.getTranslatedX(zone[0]);
  pixelZone[1] = field.getTranslatedY(zone[1]);
  pixelZone[2] = field.yardsToPixels(zone[2]);
  pixelZone[3] = field.yardsToPixels(zone[3]);
  return pixelZone;
};

CoverageZone.prototype.drawFlats = function(field){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftFlat = this.getPixelZone(this.getFlats(ballX, ballY, 0));
  var rightFlat = this.getPixelZone(this.getFlats(ballX, ballY, 1));
  fill(220, 220, 0);
  rect(leftFlat[0], leftFlat[1], leftFlat[2], leftFlat[3]);
  rect(rightFlat[0], rightFlat[1], rightFlat[2], rightFlat[3]);
};

CoverageZone.prototype.drawHooks = function(fieldfieldfieldfieldfieldfield){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftHook = this.getPixelZone(this.getHooks(ballX, ballY, 0));
  var rightHook = this.getPixelZone(this.getHooks(ballX, ballY, 1));
  fill(255, 100, 135);
  rect(leftHook[0], leftHook[1], leftHook[2], leftHook[3]);
  rect(rightHook[0], rightHook[1], rightHook[2], rightHook[3]);
};

CoverageZone.prototype.drawOuts = function(field){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftOut = this.getPixelZone(this.getOuts(ballX, ballY, 0));
  var rightOut = this.getPixelZone(this.getOuts(ballX, ballY, 1));
  fill(220, 80, 230);
  rect(leftOut[0], leftOut[1], leftOut[2], leftOut[3]);
  rect(rightOut[0], rightOut[1], rightOut[2], rightOut[3]);
};

CoverageZone.prototype.drawStops = function(field){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftStop = this.getPixelZone(this.getStops(ballX, ballY, 0));
  var rightStop = this.getPixelZone(this.getStops(ballX, ballY, 1));
  fill(85, 190, 230);
  rect(leftStop[0], leftStop[1], leftStop[2], leftStop[3]);
  rect(rightStop[0], rightStop[1], rightStop[2], rightStop[3]);
};

CoverageZone.prototype.drawCurls = function(field){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftCurl = this.getPixelZone(this.getCurls(ballX, ballY, 0));
  var rightCurl = this.getPixelZone(this.getCurls(ballX, ballY, 1));
  fill(85, 230, 100);
  rect(leftCurl[0], leftCurl[1], leftCurl[2], leftCurl[3]);
  rect(rightCurl[0], rightCurl[1], rightCurl[2], rightCurl[3]);
};

CoverageZone.prototype.drawHole = function(field){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var hole = this.getPixelZone(this.getHole(ballX, ballY));
  fill(108, 190, 130);
  rect(hole[0], hole[1], hole[2], hole[3]);
};


CoverageZone.prototype.drawDeeps = function(field){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftDeep = this.getPixelZone(this.getDeeps(ballX, ballY, 0));
  var rightDeep = this.getPixelZone(this.getDeeps(ballX, ballY, 1));
  fill(85, 190, 230);
  rect(leftDeep[0], leftDeep[1], leftDeep[2], leftDeep[3]);
  fill(220, 220, 0);
  rect(rightDeep[0], rightDeep[1], rightDeep[2], rightDeep[3]);
};

CoverageZone.prototype.drawFades = function(field){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftFade = this.getPixelZone(this.getFades(ballX, ballY, 0));
  var rightFade = this.getPixelZone(this.getFades(ballX, ballY, 1));
  fill(215, 150, 25);
  rect(leftFade[0], leftFade[1], leftFade[2], leftFade[3]);
  rect(rightFade[0], rightFade[1], rightFade[2], rightFade[3]);
};

/// 3 DEEP ZONE ///
CoverageZone.prototype.drawAllCoverageZones = function(field){
  stroke(0);
  this.drawFlats(field);
  this.drawHooks(field);
  this.drawOuts(field);
  this.drawStops(field);
  this.drawCurls(field);
  this.drawHole(field);
  this.drawDeeps(field);
  this.drawFades(field);
};
*/