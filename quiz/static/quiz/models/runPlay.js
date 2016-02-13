var RunPlay = function(config){
  this.ballCarrier = config.ballCarrier || null;
  this.ballRecipient = config.ballRecipient || null;
  this.exchangePoints = config.exchangePoints || []; //not using this for now
  this.carrierBreakPoints = config.carrierBreakPoints || []; //x,y coordinates?
  this.recipientBreakPoints = config.recipientBreakPoints || []; //Breakpoints like routes
  this.hasExchanged = config.hasExchanged || false;
};

RunPlay.prototype.stepRunBackward = function() {
  if (this.recipientBreakPoints.length > 1) {
    this.recipientBreakPoints.pop();
    this.ballRecipient.runNodes.pop();
  }
};

RunPlay.prototype.draw = function(field){
  for(var i = 0; i < this.carrierBreakPoints.length - 1; i++){
    var x1 = field.getTranslatedX(this.carrierBreakPoints[i][0]);
    var y1 = field.getTranslatedX(this.carrierBreakPoints[i][0]);
    var x2 = field.getTranslatedX(this.carrierBreakPoints[i+1][0]);
    var y2 = field.getTranslatedY(this.carrierBreakPoints[i+1][1]);
    stroke(0, 0, 255);
    fill(0, 0, 255);
    line(x1, y1, x2, y2);

    var node = this.ballCarrier.runNodes[i];
    if(node){
      if(node.change){
        node.x = field.getYardX(mouseX);
        node.y = field.getYardY(mouseY);
        this.carrierBreakPoints[i + 1][0] = node.x;
        this.carrierBreakPoints[i + 1][1] = node.y;
      }
      node.draw(field);
    }

  }
  for(var i = 0; i < this.recipientBreakPoints.length - 1; i++){
    var x1 = field.getTranslatedX(this.recipientBreakPoints[i][0]);
    var y1 = field.getTranslatedY(this.recipientBreakPoints[i][1]);
    var x2 = field.getTranslatedX(this.recipientBreakPoints[i+1][0]);
    var y2 = field.getTranslatedY(this.recipientBreakPoints[i+1][1]);
    stroke(0, 0, 255);
    fill(0, 0, 255);
    line(x1, y1, x2, y2);
    noStroke();
    node = this.ballRecipient.runNodes[i]
    if(node){
      if(node.change){
        node.x = field.getYardX(mouseX);
        node.y = field.getYardY(mouseY);
        this.recipientBreakPoints[i + 1][0] = node.x;
        this.recipientBreakPoints[i + 1][1] = node.y;
      }
      node.draw(field);
    }

    //nodes?

  }
}
