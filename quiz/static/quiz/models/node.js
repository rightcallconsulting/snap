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
