var RunPlay = function(config){
  this.ballCarrier = config.ballCarrier || null;
  this.ballRecipient = config.ballRecipient || null;
  this.exchangePoints = config.exchangePoints || []; //[(ball carrier x,y), (recipient x,y)]
  this.carrierBreakPoints = config.carrierBreakPoints || []; //x,y coordinates?
  this.recipientBreakPoints = config.recipientBreakPoints || []; //Breakpoints like routes
  this.hasExchanged = config.hasExchanged || false;
};

RunPlay.prototype.draw = function(field){
  if(this.ballCarrier & this.carrierBreakPoints.length > 0){
    var x1 = field.getTranslatedX(this.ballCarrier.x);
    var y1 = field.getTranslatedY(this.ballCarrier.y);
    for(var i = 0; i < this.carrierBreakPoints.length; i++){
      var x2 = field.getTranslatedX(this.carrierBreakPoints[i][0]);
      var y2 = field.getTranslatedY(this.carrierBreakPoints[i][1]);
      stroke(0,0,255);
      line(x1, y1, x2, y2);
    }
  }

}
