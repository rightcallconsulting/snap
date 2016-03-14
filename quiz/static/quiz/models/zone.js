//// CREATING FIELD ZONES FOR PASS COVERAGE ////

/*
flatWidth = 5.333
hookWidth = 10.666

flatDepth = 6
hookDepth = 12 
*/


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
Field.prototype.getHook = function(ballX, ballY, strength){
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

Field.prototype.getPixelZone = function(zone){
  var pixelZone = [0.0, 0.0, 0.0, 0.0];
  pixelZone[0] = this.getTranslatedX(zone[0]);
  pixelZone[1] = this.getTranslatedY(zone[1]);
  pixelZone[2] = this.yardsToPixels(zone[2]);
  pixelZone[3] = this.yardsToPixels(zone[3]);
  return pixelZone;
};
/*
Field.prototype.drawFlats = function(){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftFlat; 
  var rightFlat;
  var a = leftFlat === field.getPixelZone(field.getFlat(ballX, ballY, 0));
  var b = rightFlat === field.getPixelZone(field.getFlat(ballX, ballY, 1));
  
  fill(220, 220, 0);
  rect(a[0], a[1], a[2], a[3]);
  rect(b[0], b[1], b[2], b[3]);
};

Field.prototype.drawHooks = function(){
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  var leftHook;
  var rightHook;
  var a = leftHook === field.getPixelZone(field.getHook(ballX, ballY, 0));
  var b = rightHook === field.getPixelZone(field.getHook(ballX, ballY, 1));

  rect(a[0], a[1], a[2], a[3]);
  rect(b[0], b[1], b[2], b[3]);
};
*/
/// 3 DEEP ZONE ///
Field.prototype.drawAllCoverageZones = function(){
  stroke(0);
  var ballX = test.getCurrentFormation().oline[2].x;
  var ballY = test.getCurrentFormation().oline[2].y;
  /// HOLE ///
  var hole = this.getPixelZone(this.getHole(ballX, ballY));
  fill(108, 190, 130);
  rect(hole[0], hole[1], hole[2], hole[3]);

  /// FLATS ///
  var leftFlat = this.getPixelZone(this.getFlats(ballX, ballY, 0));
  var rightFlat = this.getPixelZone(this.getFlats(ballX, ballY, 1));
  fill(220, 220, 0);
  rect(leftFlat[0], leftFlat[1], leftFlat[2], leftFlat[3]);
  rect(rightFlat[0], rightFlat[1], rightFlat[2], rightFlat[3]);
  
  /// HOOKS ///
  var leftHook = field.getPixelZone(this.getHook(ballX, ballY, 0));
  var rightHook = field.getPixelZone(this.getHook(ballX, ballY, 1));
  fill(255, 100, 135);
  rect(leftHook[0], leftHook[1], leftHook[2], leftHook[3]);
  rect(rightHook[0], rightHook[1], rightHook[2], rightHook[3]);

    /// OUTS ///
    var leftOut = field.getPixelZone(this.getOuts(ballX, ballY, 0));
    var rightOut = field.getPixelZone(this.getOuts(ballX, ballY, 1));
    fill(220, 80, 230);
    rect(leftOut[0], leftOut[1], leftOut[2], leftOut[3]);
    rect(rightOut[0], rightOut[1], rightOut[2], rightOut[3]); 

    /// STOPS ///
    var leftStop = this.getPixelZone(this.getStops(ballX, ballY, 0));
    var rightStop = this.getPixelZone(this.getStops(ballX, ballY, 1));
    fill(242, 164, 80);
    rect(leftStop[0], leftStop[1], leftStop[2], leftStop[3]);
    rect(rightStop[0], rightStop[1], rightStop[2], rightStop[3]);

    /// CURLS ///
    var leftCurl = this.getPixelZone(this.getCurls(ballX, ballY, 0));
    var rightCurl = this.getPixelZone(this.getCurls(ballX, ballY, 1));
    fill(180, 80, 240);
    rect(leftCurl[0], leftCurl[1], leftCurl[2], leftCurl[3]);
    rect(rightCurl[0], rightCurl[1], rightCurl[2], rightCurl[3]);    
  };
