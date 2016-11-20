var Node = function(config){
  this.x = config.x;
  this.y = config.y;
  this.siz = config.siz || 1;
  this.change = false;
  this.fill = config.fill || Colors.nodeColor();
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
  var siz = field.yardsToPixels(this.siz)/2;
  noStroke();
  fill(this.fill);
  ellipse(x, y, siz, siz);
};

Node.prototype.drawArrow = function(field, prevX, prevY) {
  var x = field.getTranslatedX(this.x);
  var y = field.getTranslatedY(this.y);
  var s = field.yardsToPixels(this.siz)*1.2;

  var dx = this.x - prevX;
  var dy = this.y - prevY;
  var theta;
  if(dx === 0.0){
    theta = PI / 2;
    if(dy < 0){
      theta += PI;
    }
  }else{
      theta = PI - atan((dy)/(-dx));
  }

  if(dx > 0){
    theta = atan(dy/dx);
    if(theta < 0){
      theta += 2 * PI;
    }
  }

  var x1= int(x + s*cos(theta + 3 * PI / 2));
  var y1= int(y - s*sin(theta + 3 * PI / 2));
  var x2= int(x + s*cos(theta));
  var y2= int(y - s*sin(theta));
  var x3= int(x + s*cos(theta + PI / 2));
  var y3= int(y - s*sin(theta + PI / 2));

  //var stringified = "(" + x1 + ", " + y1 + "), (" + x2 + ", " + y2 + "), (" + x3 + ", " + y3 + "),"

  noStroke();
  fill(this.fill);
  triangle(x1, y1, x2, y2, x3, y3);

  //var locationStr = "" + int(dx) + ", " + int(dy);
  //text(stringified, x+50, y+30);
  //text(theta*180/PI, x+50, y+50);
};
