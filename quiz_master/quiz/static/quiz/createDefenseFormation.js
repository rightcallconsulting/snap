var formations = [];
var makeJSONCall = true;

function setup() {
  var myCanvas = createCanvas(400, 600);
  background(58, 135, 70);
  myCanvas.parent('quiz-box');
}

function draw() {

  if(makeJSONCall){
    makeJSONCall = false
    $.getJSON('/quiz/teams/1/formations', function(data, jqXHR){
      data.forEach(function(formationObject){
        formationObject.fields.id = formationObject.pk;
        formationObject.fields.positions = [];
        var newFormation = new Formation(formationObject.fields);
        newFormation.playName = formationObject.fields.name;
        formations.push(newFormation);
      })
        $.getJSON('/quiz/teams/1/formations/positions', function(data, jqXHR){
          data.forEach(function(position){
            position.fields.id = position.pk;
            position.fields.x = position.fields.startX;
            position.fields.y = position.fields.startY;
            position.fields.pos = position.fields.name;
            position.fields.num = position.fields.pos;
            var newPlayer = new Player(position.fields)
            if(newPlayer.pos==="QB"){
              newPlayer.fill = color(212, 130, 130);
            }
            else if(newPlayer.pos==="OL"){
              newPlayer.fill = color(143, 29, 29);
            }
            else{
              newPlayer.fill = color(255, 0, 0);
            }
            formation = formations.filter(function(formation){return formation.id == position.fields.formation})[0]
            formation.positions.push(newPlayer);
          })
          formations.forEach(function(formation){
            formation.populatePositions();
          })
          runTest();

        })

    });
  }

  var runTest = function(){


    //Field Position Variables
    var currentFormation = formations[0];

    var getCurrentFormation = function(){
      return currentFormation;
    };

    var scoreboard = new Scoreboard({

    });

    // Create Position groups
    var formationExample = new Formation({
      unit: "defense"
    })


    // Global Variables
    var capitalLetter = false;

    Player.prototype.draw = function() {
        if(this.unit === "offense"){
            noStroke();
            if(this.rank > 0){
                fill(255, 255, 0);
            }else{
                fill(this.fill);
            }
            if (this.change){
              this.x = mouseX;
              this.y = mouseY;
              }
            ellipse(this.x, this.y, this.siz, this.siz);
            fill(0,0,0);
            textSize(14);
            textAlign(CENTER, CENTER);
            if(this.rank > 0){
                text(this.rank, this.x, this.y);
            }else{
                text(this.num, this.x, this.y);
            }
            if (this.showRoute && this.breakPoints.length > 0 && !play.clicked){
              this.displayRoute(this.breakPoints);
            }
            if (this.showPreviousRoute){
              stroke(0, 255, 0);
              this.displayRoute(this.previousRouteBreakpoints);
            }
            if (this.showPreviousRouteGuess){
              stroke(255, 0, 0);
              this.displayRoute(this.previousRouteGuess);
            }
        }
        else {
            fill(this.fill);
            textSize(17);
            textAlign(CENTER, CENTER);
            text(this.pos, this.x, this.y);
        }
        this.drawRoute();
        noStroke();
    };

    Player.prototype.select = function() {
        this.rank = 1;
        this.clicked = true;
        // Unselect all other players to isolate one route
        for(var i = 0; i < formationExample.eligibleReceivers.length; i++){
          var p = formationExample.eligibleReceivers[i];
          if(p !== this){
            p.clicked = false;
            p.rank = 0;
          }
        }
    };

    Player.prototype.unselect = function() {
        this.clicked = false;
        this.rank = 0;
    };

    // Create Buttons
    var save = new Button({
        x: 10,
        y: 360,
        width: 35,
        label: "Save",
        clicked: false,
        displayButton: true
    });

    var trash = new Button({
        x: 330,
        y: 360,
        width: 40,
        label: "Trash",
        clicked: false,
        displayButton: true
    });

    var clear = new Button({
        x: 53,
        y: 360,
        width: 40,
        label: "Clear",
        clicked: false,
        displayButton: true
    });

    // Create Position groups

    var dl = new Player ({
        x: 120,
        y: 375,
        num: 'DL',
        fill: color(0, 0, 0),
        pos: 'DL',
        unit: "defense"
    });

    var de = new Player ({
        x: 150,
        y: 375,
        num: 'DE',
        fill: color(0, 0, 0),
        pos: 'DE',
        unit: "defense"
    });

    var mike = new Player ({
      x: 180,
      y: 375,
      num: 'M',
      fill: color(0, 0, 0),
      pos: 'M',
      unit: "defense"
    });

    var will = new Player ({
      x: 205,
      y: 375,
      num: 'W',
      fill: color(0, 0, 0),
      pos: 'W',
      unit: "defense"
    });

    var sam = new Player ({
      x: 230,
      y: 375,
      num: 'S',
      fill: color(0, 0, 0),
      pos: 'S',
      unit: "defense"
    });

    var cb = new Player({
      x: 260,
      y: 375,
      num: 'CB',
      fill: color(0, 0, 0),
      pos: 'CB',
      unit: "defense"
    });

    var ss = new Player({
      x: 290,
      y: 375,
      num: 'SS',
      fill: color(0, 0, 0),
      pos: 'SS',
      unit: "defense"
    });

    var fs = new Player({
      x: 320,
      y: 375,
      num: 'FS',
      fill: color(0, 0, 0),
      pos: 'FS',
      unit: "defense"
    });

    formationExample.optionsToCreate.push(dl);
    formationExample.optionsToCreate.push(mike);
    formationExample.optionsToCreate.push(will);
    formationExample.optionsToCreate.push(sam);
    formationExample.optionsToCreate.push(cb);
    formationExample.optionsToCreate.push(de);
    formationExample.optionsToCreate.push(ss);
    formationExample.optionsToCreate.push(fs);

    var defensePlay = new DefensivePlay({
      defensivePlayers: [],
      dlAssignments: [[5,1,2,6],[5,1,2,6],[5,1,2,6]],
      lbAssignments: [[,-3,-4],[-3,1,4],[-3,0,8]],
      dbAssignments: [[-6,-8,-9,-7],[-1,-2,-4,-5],[-1,-2,-4,-5]],
      dlPositions: ["DE", "NT", "DT", "RE"],
      lbPositions: ["W", "M", "S"],
      dbPositions: ["CB", "SS", "F/S", "CB"],
      dlNames: ["Gronk", "Davis", "Smith", "Evans"]
    });

    // intro scene
    var drawOpening = function() {
        field.drawBackground(getCurrentFormation(), height, width);
        save.draw();
        clear.draw();
        trash.draw();
        formationExample.drawOptionsToCreate();
        formationExample.drawAllPlayers();
        formationButtons.forEach(function(button){
          button.draw();
        })
        defensePlay.drawAllPlayers();
        currentFormation.drawAllPlayers();
        text("Offensive Formation: "+getCurrentFormation().playName, 100, 20);
        fill(0, 0, 0);
        textSize(20);
        text(getCurrentFormation().feedbackMessage, 330, 20);
        fill(176,176,176)
    };

    var isInsideTrash = function(player){
      return player.x > trash.x &&
             player.x < trash.x + trash.width &&
             player.y > trash.y &&
             player.y < trash.y + trash.height
    };

    keyReleased = function(){
      if (keyCode === SHIFT){
        capitalLetter = false;
      }
    };

    keyPressed = function() {
      selectedWR = formationExample.findSelectedWR();
      if (keyCode === SHIFT){
        capitalLetter = true;
      }
      if (keyCode === BACKSPACE){
        if (selectedWR){
          selectedWR.stepRouteBackward();
        } else{
          formationExample.playName = formationExample.playName.substring(0, formationExample.playName.length - 1);
        }
      }
      else{
        formationExample.playName += capitalLetter ? key : key.toLowerCase();
      }
    };

    mouseDragged = function(){
      var receiverClicked = formationExample.mouseInReceiverOrNode()[0];
      var selectedNode = formationExample.mouseInReceiverOrNode()[1];
      var positionOptionSelected = formationExample.mouseInOptionsToCreate();
      if (formationExample.establishingNewPlayer){
        formationExample.establishingNewPlayer.movePlayer();
      }

      else if (positionOptionSelected){
        var newPlayer = new Player({
          x: positionOptionSelected.x,
          y: positionOptionSelected.y,
          num: positionOptionSelected.num,
          fill: color(0, 0, 0),
          unit: "defense",
          change: true,
          pos: positionOptionSelected.pos
        })
        formationExample.createPlayer(newPlayer);
      }
      else if (clear.isMouseInside()){
        formationExample.removeAllPlayers();
      }
      var receiverClicked = formationExample.mouseInReceiverOrNode()[0];
      var selectedNode = formationExample.mouseInReceiverOrNode()[1];
      selectedWR = formationExample.findSelectedWR();
      if(selectedNode){
        selectedNode.change = true;
      }
    };

    mouseClicked = function() {
      var receiverClicked = formationExample.mouseInReceiverOrNode()[0];
      var selectedNode = formationExample.mouseInReceiverOrNode()[1];
      var formationClicked = isFormationClicked(formationButtons);
      selectedWR = formationExample.findSelectedWR();
      if (formationExample.establishingNewPlayer){
        if(isInsideTrash(formationExample.establishingNewPlayer)){
          formationExample.deletePlayer(formationExample.establishingNewPlayer);
        }
        formationExample.establishingNewPlayer.change = false;
        formationExample.establishingNewPlayer = null;
      }
      else if (clear.isMouseInside()){
        formationExample.removeAllPlayers();
      }
      else if(selectedNode){
        if (selectedNode.change){
          selectedNode.change = false;
        }
        else{
          selectedNode.change = true;
        }
      }
      else if (formationClicked){
        currentFormation = formations.filter(function(formation) {
          return formation.playName == formationClicked.label;
        })[0];
      }
      else if (receiverClicked){
          var playerSelected = false;
          for(var i = 0; i < formationExample.eligibleReceivers.length; i++){
              var p = formationExample.eligibleReceivers[i];
              if (p.isMouseInside()){
                  if(p.clicked){
                      p.unselect();
                      p.showRoute = false;
                  }else{
                      p.select();
                  }
                  break;
              }
          }
      }
      else if(selectedWR){
        selectedWR.routeCoordinates.push([mouseX, mouseY]);
        var nodeObject = new Node({
            x: mouseX,
            y: mouseY,
            siz: 10
        });
        selectedWR.routeNodes.push(nodeObject);
      }
      else if (save.isMouseInside()) {
        if(formationExample.validPlay()){
          formationExample.eligibleReceivers.forEach(function(player){
            player.convertRouteDrawingToBreakPoints();
          })
          var newFormation = new Formation({
              eligibleReceivers: formationExample.eligibleReceivers,
              playName: formationExample.playName,
              qb: formationExample.qb,
              oline: formationExample.oline,
              offensivePlayers: formationExample.offensivePlayers
          });
          newFormation.saveToDB();
          formationExample.removeAllPlayers();
          formationExample.playName = "";
          formationExample.feedbackMessage = "Saved!"
          // Logic to save the play to the database

        } else{
          formationExample.feedbackMessage = "Invalid Play"
        }
      }
    };

    createFormationButtons(formations);

    draw = function() {
      drawOpening();
    }
  }
};
