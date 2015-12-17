var Field = function(config){
    this.heightInYards = config.heightInYards || null;
    this.typeField = config.typeField || null;

};

var field = new Field({
  heightInYards: 30
});

var createPlayField = new Field({
  heightInYards: 30,
  typeField: "Create"
});


Field.prototype.drawBackground = function(play, height, width) {
    background(93, 148, 81);
    for(var i = 0; i < this.heightInYards; i++){
        var yc = height * (i/this.heightInYards);
        stroke(255, 255, 255);
        if(i % 10 === 0){
            line(0, yc, width, yc);
        }else if(i % 5 === 0){
            line(0, yc, width, yc);
        }else{
            line(width*0.24, yc, width*0.25, yc);
            line(width*0.74, yc, width*0.75, yc);
        }
    }
    textSize(18);
    textAlign(LEFT);
    if(play && !play.newPlay){
      fill(255,255,255)
      text(play.playName,10,23);
    }
    else if(this.typeField == "Create"){
      text("Play: "+ play.playName, 10, 53);
    }
};
