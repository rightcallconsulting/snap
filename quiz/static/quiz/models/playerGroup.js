// Constructor

var PlayerGroup = function(config) {
    this.name = config.name || "";
    this.id = config.id || 0;
    this.players = config.players || [];
};

// Prototype Methods

PlayerGroup.prototype.getPlayers = function(){
  return this.players;
}

PlayerGroup.prototype.getGroupName = function(){
  return this.name;
}

PlayerGroup.prototype.getGroupID = function(){
  return this.id;
}

//JSON

var createPlayerGroupFromJSONSeed = function(seed){
  var jsonPlayers = seed.players;
  var players = [];
  for(var i = 0; i < jsonPlayers.length; i++){
    players.push(createUserFromJSONSeed(jsonPlayers[i]));
  }
  return new PlayerGroup({
    name: seed.name,
    players: players,
    id: seed.id
  })
}

var createPlayerGroupsFromJSONSeed = function(seed){
  var groups = []
  for(var i = 0; i < seed.length; i++){
    groups.push(createPlayerGroupFromJSONSeed(seed[i]));
  }
  return groups;
}
