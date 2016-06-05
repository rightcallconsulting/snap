 var DefensivePlayer = function(config){
    this.x = config.x || width/2;
    this.y = config.y || height/2;
    this.siz = config.siz || 25;
    this.fill = config.fill || color(0, 0, 0);
    this.pos = config.pos || "X";
    this.num = config.num || 0;
    this.unit = config.unit || "offense";
    this.name = config.name || "";
    this.gap = config.gap || 0;
    this.speed = 1;
    this.CBAssignment = config.CBAssignment || null;
    this.isBeingTested = config.isBeingTested || false;
};

DefensivePlayer.prototype.draw = function(){
    if(this.clicked){
      fill(255,255,0);
    }else{
      fill(255,255,255);
    }  
    strokeWeight(1);  
    textSize(20);
    textAlign(CENTER, CENTER);
    text(this.pos, this.x, this.y);  
  };

DefensivePlayer.prototype.changeClickStatus = function(){
  if (this.clicked) {
        this.fill = color(255, 255, 0);
        this.clicked = false;
        this.draw();
    } else {
        this.fill = color(255);
        this.clicked = true;
        this.draw();
    }
};

DefensivePlayer.prototype.isMouseInside = function() {
    return mouseX > this.x-this.siz/1 &&
           mouseX < (this.x + this.siz/1) &&
           mouseY > this.y - this.siz/1 &&
           mouseY < (this.y + this.siz/1);
};

