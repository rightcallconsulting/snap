var Node = function(config){
  this.x = config.x;
  this.y = config.y;
  this.siz = config.siz;
  this.change = false;
};

Node.prototype.isMouseInside = function() {
    return mouseX > this.x-this.siz/1 &&
           mouseX < (this.x + this.siz/1) &&
           mouseY > this.y - this.siz/1 &&
           mouseY < (this.y + this.siz/1);
};

Node.prototype.draw = function() {
        noStroke();
        fill(255, 0, 0);
        ellipse(this.x, this.y, this.siz, this.siz);
};
