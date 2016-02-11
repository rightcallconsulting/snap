var formations = [];
var makeJSONCall = true;
var personnelButtons = [];
var currentPersonnel = "Base";
var currentOffensiveFormation;
var formationExample;

function setup() {
  var myCanvas = createCanvas(400, 400);
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
            position.fields.index = position.fields.playerIndex;
            var newPlayer = new Player(position.fields)
            if(newPlayer.pos==="QB"){
              newPlayer.fill = color(212, 130, 130);
            }
            else if(newPlayer.pos==="OL" || newPlayer.pos ==="LT" || newPlayer.pos ==="LG" || newPlayer.pos ==="C" || newPlayer.pos ==="RG" || newPlayer.pos ==="RT"){
              newPlayer.fill = color(143, 29, 29);
            }
            else{
              newPlayer.fill = color(255, 0, 0);
            }
            formation = formations.filter(function(formation){return formation.id == position.fields.formation})[0]
            if(formation){
              formation.positions.push(newPlayer);
            }
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
    currentOffensiveFormation = formations[0];
    var getCurrentFormation = function(){
      return currentOffensiveFormation;
    };

    var scoreboard = new Scoreboard({

    });

    // Create Position groups
    formationExample = new Formation({
      unit: "defense"
    })


    // Global Variables
    var capitalLetter = false;

    Player.prototype.draw = function(field) {
      var x = field.getTranslatedX(this.x);
      var y = field.getTranslatedY(this.y);
      var siz = field.yardsToPixels(this.siz);
        if(this.unit === "offense"){
            noStroke();
            if(this.rank > 0){
                fill(255, 255, 0);
            }else{
                fill(this.fill);
            }
            if (this.change){
              this.x = field.getYardX(mouseX);
              this.y = field.getYardY(mouseY);
              }
            ellipse(x, y, siz, siz);
            fill(0,0,0);
            textSize(14);
            textAlign(CENTER, CENTER);
            if(this.rank > 0){
                text(this.rank, x, y);
            }else{
                text(this.num, x, y);
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
            if(this.clicked){
              fill(0, 0, 255);
            }
            else{
              fill(this.fill);
            }
            textSize(17);
            textAlign(CENTER, CENTER);
            text(this.pos, x, y);
            if(this.CBAssignment){
              stroke(255, 0, 0);
              line(x, y, field.getTranslatedX(this.CBAssignment.x), field.getTranslatedY(this.CBAssignment.y));
            }
            else if (this.zoneXPoint && this.zoneYPoint){
              stroke(255, 0, 0);
              line(x, y, this.zoneXPoint, this.zoneYPoint);
              fill(255, 0, 0);
              // triangle(this.zoneXPoint, this.zoneYPoint, 100, 100, 200, 200);
              // TBD Draw a rectangle
              noFill()
              rect(this.zoneXPoint, this.zoneYPoint, 40, 40);
            }
            else if (this.rusher && this.gapXPoint){
              stroke(255, 0, 0);
              line(x, y, field.getTranslatedX(this.gapXPoint), field.getTranslatedY(this.gapYPoint));
              fill(255, 0, 0);
              noFill()
              ellipse(field.getTranslatedX(this.gapXPoint), field.getTranslatedY(this.gapYPoint), 50);
            }
        }
        this.drawRoute();
        noStroke();
    };

    Player.prototype.select = function() {
        this.rank = 1;
        this.clicked = true;
        // Unselect all other players to isolate one route
        for(var i = 0; i < formationExample.defensivePlayers.length; i++){
          var p = formationExample.defensivePlayers[i];
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
        x: field.getYardX(width * 0.8),
        y: field.getYardY(height * 0.88),
        width: field.pixelsToYards(width * 0.12),
        height: field.pixelsToYards(width * 0.08),
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

    var base = new Button({
        x: 450,
        y: 10,
        width: 70,
        label: "Base",
        clicked: false,
        displayButton: true
    });

    var nickel = new Button({
        x: 450,
        y: 50,
        width: 70,
        label: "Nickel",
        clicked: false,
        displayButton: true
    });

    var jumbo = new Button({
        x: 200,
        y: 75,
        width: 5,
        label: "Jumbo",
        clicked: false,
        displayButton: true
    });

    var goalLine = new Button({
        x: 450,
        y: 130,
        width: 70,
        label: "Goal Line",
        clicked: false,
        displayButton: true
    });

    personnelButtons.push(base)
    personnelButtons.push(nickel)
    personnelButtons.push(jumbo)
    personnelButtons.push(goalLine)

    // Create Position groups

    var dl = new Player ({
        x: 10,
        y: 100-field.heightInYards,
        siz: 3,
        num: 'DL',
        fill: color(0, 0, 0),
        pos: 'DL',
        unit: "defense"
    });

    var de = new Player ({
        x: 13,
        y: 100-field.heightInYards,
        num: 'DE',
        fill: color(0, 0, 0),
        pos: 'DE',
        unit: "defense"
    });

    var mike = new Player ({
      x: 16,
      y: 100-field.heightInYards,
      num: 'M',
      fill: color(0, 0, 0),
      pos: 'M',
      unit: "defense"
    });

    var will = new Player ({
      x: 19,
      y: 100-field.heightInYards,
      num: 'W',
      fill: color(0, 0, 0),
      pos: 'W',
      unit: "defense"
    });

    var sam = new Player ({
      x: 22,
      y: 100-field.heightInYards,
      num: 'S',
      fill: color(0, 0, 0),
      pos: 'S',
      unit: "defense"
    });

    var cb = new Player({
      x: 25,
      y: 100-field.heightInYards,
      num: 'CB',
      fill: color(0, 0, 0),
      pos: 'CB',
      unit: "defense"
    });

    var ss = new Player({
      x: 28,
      y: 100-field.heightInYards,
      num: 'SS',
      fill: color(0, 0, 0),
      pos: 'SS',
      unit: "defense"
    });

    var fs = new Player({
      x: 31,
      y: 100-field.heightInYards,
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
        text(formationExample.playName, 10, 50)
        save.draw(field);
        clear.draw(field);
        trash.draw(field);
        formationExample.drawOptionsToCreate(field);
        formationExample.drawAllPlayers(field);
        formationButtons.forEach(function(button){
          button.draw(field);
        })
        personnelButtons.forEach(function(button){
          button.draw(field);
        })
        currentOffensiveFormation.drawAllPlayers(field);
        fill(0, 0, 0);
        textSize(20);
        text(getCurrentFormation().feedbackMessage, 330, 20);
        fill(176,176,176)
    };

    var isInsideTrash = function(player){
      return player.x > trash.x &&
             player.x < trash.x + trash.width &&
             player.y < trash.y &&
             player.y < trash.y + trash.height
    };

    keyReleased = function(){
      if (keyCode === SHIFT){
        capitalLetter = false;
      }
    };

    keyTyped = function(){

    }

    keyPressed = function() {
      selectedWR = formationExample.findSelectedWR();
      var selectedDefensivePlayer = formationExample.findSelectedDefensivePlayer();
      if (keyCode === SHIFT){
        capitalLetter = true;
      }

      if (keyCode === BACKSPACE){
        if (selectedWR){
          selectedWR.stepRouteBackward();
        } else{
          formationExample.playName = formationExample.playName.substring(0, formationExample.playName.length - 1);
        }
        return false
      }
      else if (selectedDefensivePlayer && keyCode == 80){
        if(selectedDefensivePlayer.rusher){
          selectedDefensivePlayer.rusher = false;
          selectedDefensivePlayer.gapXPoint = null;
          selectedDefensivePlayer.gapYPoint = null;
        }
        else {
          selectedDefensivePlayer.rusher = true;
          selectedDefensivePlayer.zoneXPoint = null;
          selectedDefensivePlayer.zoneYPoint = null;
          selectedDefensivePlayer.CBAssignment = null;
        }
        return true;
      }
      else{
        formationExample.playName += capitalLetter ? key : key.toLowerCase();
      }
    };

    mouseDragged = function(){
      var defensivePlayerClicked = formationExample.mouseInDefensivePlayer(field);
      var receiverClicked = formationExample.mouseInReceiverOrNode(field)[0];
      var selectedNode = formationExample.mouseInReceiverOrNode(field)[1];
      var positionOptionSelected = formationExample.mouseInOptionsToCreate(field);
      if (formationExample.establishingNewPlayer){
        formationExample.establishingNewPlayer.movePlayer(field);
      }
      else if (defensivePlayerClicked){
        defensivePlayerClicked.change = defensivePlayerClicked.change ?  false : true;
        formationExample.establishingNewPlayer = defensivePlayerClicked;
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

      var receiverClicked = formationExample.mouseInReceiverOrNode(field)[0];
      var selectedNode = formationExample.mouseInReceiverOrNode(field)[1];
      selectedWR = formationExample.findSelectedWR();
      if(selectedNode){
        selectedNode.change = true;
      }
    };

    var isPersonnelClicked = function(personnelButtonArray){
      var personnelClicked;
      personnelButtonArray.forEach(function(button){
        if (button.isMouseInside(field)){
          personnelClicked = button;
        }
      })
      return personnelClicked;
    };

    mouseClicked = function() {
      var defensivePlayerClicked = formationExample.mouseInDefensivePlayer(field);
      var receiverClicked = currentOffensiveFormation.mouseInReceiverOrNode(field)[0];
      var selectedNode = currentOffensiveFormation.mouseInReceiverOrNode(field)[1];
      // var formationClicked = isFormationClicked(formationButtons);
      // var personnelClicked = isPersonnelClicked(personnelButtons);
      selectedWR = formationExample.findSelectedWR();
      var selectedDefensivePlayer = formationExample.findSelectedDefensivePlayer();
      if (formationExample.establishingNewPlayer){
        if(isInsideTrash(formationExample.establishingNewPlayer)){
          formationExample.deletePlayer(formationExample.establishingNewPlayer);
        }
        formationExample.establishingNewPlayer.change = false;
        formationExample.establishingNewPlayer = null;
      }

      else if (clear.isMouseInside(field)){
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

      else if (selectedDefensivePlayer && receiverClicked){
        if(!selectedDefensivePlayer.isALineman()){
          selectedDefensivePlayer.CBAssignment = receiverClicked;
        }
        receiverClicked.unselect();
      }

      else if (defensivePlayerClicked){
          var playerSelected = false;
          for(var i = 0; i < formationExample.defensivePlayers.length; i++){
              var p = formationExample.defensivePlayers[i];
              if (p.isMouseInside(field)){
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
      else if (selectedDefensivePlayer && selectedDefensivePlayer.rusher){
        selectedDefensivePlayer.gapXPoint = field.getYardX(mouseX);
        selectedDefensivePlayer.gapYPoint = field.getYardY(mouseY);
      }
      else if (selectedDefensivePlayer){
        selectedDefensivePlayer.zoneXPoint = mouseX;
        selectedDefensivePlayer.zoneYPoint = mouseY;
        selectedDefensivePlayer.CBAssignment = null;
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

    };

    pressSaveButton = function() {
      if(formationExample.validFormation()){
        var newFormation = new Formation({
            defensivePlayers: formationExample.defensivePlayers,
            playName: formationExample.playName,
            dline: formationExample.dline,
            linebackers: formationExample.linebackers,
            cornerbacks: formationExample.cornerbacks,
            safeties: formationExample.safeties,
            unit: formationExample.unit,
            offensiveFormationID: currentOffensiveFormation.id
        });
        newFormation.saveToDB();
        formationExample.removeAllPlayers();
        formationExample.playName = "";
        formationExample.feedbackMessage = "Saved!"

      } else{
        formationExample.feedbackMessage = "Invalid Play"
      }
    }

    pressClearButton = function() {
      formationExample.removeAllPlayers();
    }

    createFormationButtons(formations);

    draw = function() {
      drawOpening();
    }
  }
};
