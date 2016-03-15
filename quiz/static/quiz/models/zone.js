Field.prototype.getOuts = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - 26.65;
    var yCoord = ballY + 11.5;
  }else if(strength === 1){
    var xCoord = ballX + 21.335;
    var yCoord = ballY + 11.5;
  }
  return [xCoord, yCoord, 5.333, 5];
};

Field.prototype.getFlats = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - 26.65;
    var yCoord = ballY + 6.5;
  }else if (strength === 1) {
    var xCoord = ballX + 21.35;
    var yCoord = ballY + 6.5;
  }
  return [xCoord, yCoord, 5.333, 5];
};

Field.prototype.getCurls = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - 21.333;
    var yCoord = ballY + 11.5;
  }else if(strength === 1){
    var xCoord = ballX + 16.333;
    var yCoord = ballY + 11.5;
  }
  return [xCoord, yCoord, 5.333, 5];
};

Field.prototype.getStops = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - 21.333;
    var yCoord = ballY + 6.5;
  }else if (strength === 1) {
    var xCoord = ballX + 16.333;
    var yCoord = ballY + 6.5;
  }
  return [xCoord, yCoord, 5.333, 5];
};

Field.prototype.getHooks = function(ballX, ballY, strength){
  if(strength === 0){
    // STRONG HOOK ZONE
    var xCoord = ballX - 16;
    var yCoord = ballY + 11;
  } else if(strength === 1){
    // WEAK HOOK ZONE
    var xCoord = ballX + 5.666;
    var yCoord = ballY + 11;
  } 
  return [xCoord, yCoord, 10.666, 9];
};

Field.prototype.getHole = function(ballX, ballY){
  var xCoord = ballX - 5.334;
  var yCoord = ballY + 11;
  return [xCoord, yCoord, 11, 9];
};
Field.prototype.getDeeps = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - 26.666;
    var yCoord = ballY + 26.666;
  } else if(strength === 1){
    // WEAK HOOK ZONE
    var xCoord = ballX;
    var yCoord = ballY + 26.666;
  } 
  return [xCoord, yCoord, ballX, 15.333];
};

Field.prototype.getFades = function(ballX, ballY, strength){
  if(strength === 0){
    var xCoord = ballX - 26.666;
    var yCoord = ballY + 13.333;
  } else if(strength === 1){
    var xCoord = ballX + 19.333;
    var yCoord = ballY + 13.333;
  } 
  return [xCoord, yCoord, 5.666, 7.666];
};

Field.prototype.getPixelZone = function(zone){
  var pixelZone = [0.0, 0.0, 0.0, 0.0];
  pixelZone[0] = this.getTranslatedX(zone[0]);
  pixelZone[1] = this.getTranslatedY(zone[1]);
  pixelZone[2] = this.yardsToPixels(zone[2]);
  pixelZone[3] = this.yardsToPixels(zone[3]);
  return pixelZone;
};

Field.prototype.drawFlats = function(){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftFlat = this.getPixelZone(this.getFlats(ballX, ballY, 0));
  var rightFlat = this.getPixelZone(this.getFlats(ballX, ballY, 1));
  fill(220, 220, 0);
  rect(leftFlat[0], leftFlat[1], leftFlat[2], leftFlat[3]);
  rect(rightFlat[0], rightFlat[1], rightFlat[2], rightFlat[3]);
};

Field.prototype.drawHooks = function(){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftHook = this.getPixelZone(this.getHooks(ballX, ballY, 0));
  var rightHook = this.getPixelZone(this.getHooks(ballX, ballY, 1));
  fill(255, 100, 135);
  rect(leftHook[0], leftHook[1], leftHook[2], leftHook[3]);
  rect(rightHook[0], rightHook[1], rightHook[2], rightHook[3]);
};

Field.prototype.drawOuts = function(){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftOut = this.getPixelZone(this.getOuts(ballX, ballY, 0));
  var rightOut = this.getPixelZone(this.getOuts(ballX, ballY, 1));
  fill(220, 80, 230);
  rect(leftOut[0], leftOut[1], leftOut[2], leftOut[3]);
  rect(rightOut[0], rightOut[1], rightOut[2], rightOut[3]);
};

Field.prototype.drawStops = function(){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftStop = this.getPixelZone(this.getStops(ballX, ballY, 0));
  var rightStop = this.getPixelZone(this.getStops(ballX, ballY, 1));
  fill(85, 190, 230);
  rect(leftStop[0], leftStop[1], leftStop[2], leftStop[3]);
  rect(rightStop[0], rightStop[1], rightStop[2], rightStop[3]);
};

Field.prototype.drawCurls = function(){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftCurl = this.getPixelZone(this.getCurls(ballX, ballY, 0));
  var rightCurl = this.getPixelZone(this.getCurls(ballX, ballY, 1));
  fill(85, 230, 100);
  rect(leftCurl[0], leftCurl[1], leftCurl[2], leftCurl[3]);
  rect(rightCurl[0], rightCurl[1], rightCurl[2], rightCurl[3]);
};

Field.prototype.drawHole = function(){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var hole = this.getPixelZone(this.getHole(ballX, ballY));
  fill(108, 190, 130);
  rect(hole[0], hole[1], hole[2], hole[3]);
};


Field.prototype.drawDeeps = function(){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftDeep = this.getPixelZone(this.getDeeps(ballX, ballY, 0));
  var rightDeep = this.getPixelZone(this.getDeeps(ballX, ballY, 1));
  fill(85, 190, 230);
  rect(leftDeep[0], leftDeep[1], leftDeep[2], leftDeep[3]);
  fill(220, 220, 0);
  rect(rightDeep[0], rightDeep[1], rightDeep[2], rightDeep[3]);
};

Field.prototype.drawFades = function(){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftFade = this.getPixelZone(this.getFades(ballX, ballY, 0));
  var rightFade = this.getPixelZone(this.getFades(ballX, ballY, 1));
  fill(215, 150, 25);
  rect(leftFade[0], leftFade[1], leftFade[2], leftFade[3]);
  rect(rightFade[0], rightFade[1], rightFade[2], rightFade[3]);
};



/// 3 DEEP ZONE ///
Field.prototype.drawAllCoverageZones = function(){
  stroke(0);
  this.drawFlats();
  this.drawHooks();
  this.drawOuts();
  this.drawStops();
  this.drawCurls();
  this.drawHole();
  this.drawDeeps();
  this.drawFades();
};
