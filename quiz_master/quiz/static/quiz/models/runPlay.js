var RunPlay = function(config){
  this.ballCarrier = config.ballCarrier || null;
  this.ballRecipient = config.ballRecipient || null;
  this.exchangePoints = config.exchangePoints || []; //[(ball carrier x,y), (recipient x,y)], relative to LOS
  
};
