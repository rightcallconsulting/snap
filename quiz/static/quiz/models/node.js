var Node = function(config){
  this.x = config.x;
  this.y = config.y;
  this.siz = config.siz;
  this.change = false;
};

Node.prototype.isMouseInside = function() {
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
  fill(255, 0, 0);
  ellipse(x, y, siz, siz);
};
