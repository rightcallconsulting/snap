var Node = function(config){
  this.x = config.x;
  this.y = config.y;
  this.siz = config.siz || 1;
  this.change = false;
  this.fill = config.fill || color(255,0,0);
};

Node.prototype.isMouseInside = function(field) {
  var x = field.getTranslatedX(this.x);
  var y = field.getTranslatedY(this.y);
  var siz = field.yardsToPixels(this.siz);
  var dist = Math.sqrt((mouseX-x)*(mouseX-x)+(mouseY-y)*(mouseY-y));
  return dist <= siz/2;
  /*
    return mouseX > this.x-this.siz/1 &&
           mouseX < (this.x + this.siz/1) &&
           mouseY > this.y - this.siz/1 &&
           mouseY < (this.y + this.siz/1);*/
};

Node.prototype.draw = function(field) {
  var x = field.getTranslatedX(this.x);
  var y = field.getTranslatedY(this.y);
  var siz = field.yardsToPixels(this.siz);
  noStroke();
  fill(this.fill);
  ellipse(x, y, siz, siz);
};

Node.prototype.drawArrow = function(field, prevX, prevY) {
  var x = field.getTranslatedX(this.x);
  var y = field.getTranslatedY(this.y);
  var s = field.yardsToPixels(this.siz)*1.5;

  var dx = this.x-prevX;
  var dy = this.y - prevY;
  var theta = atan((dy)/(dx));

  var xMid = x - s*cos(theta)*sqrt(3)/4;
  var yMid = y + s*sin(theta)*sqrt(3)/4;

  var x1= xMid - s*cos(theta+PI/2)*sqrt(3)/4;
  var y1= yMid + s*sin(theta+PI/2)*sqrt(3)/4;
  var x2= x + s*cos(theta)*sqrt(3)/4;
  var y2= y - s*sin(theta)*sqrt(3)/4;
  var x3= xMid + s*cos(theta-PI/2)*sqrt(3)/4;
  var y3= yMid + s*sin(theta-PI/2)*sqrt(3)/4;

  noStroke();
  fill(this.fill);
  triangle(x1, y1, x2, y2, x3, y3);

  var locationStr = "" + int(dx) + ", " + int(dy);
  text(locationStr, x+50, y+30);
  text(cos(theta), x+50, y+50);
};
