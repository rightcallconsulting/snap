var RunPlay = function(config){
  this.ballCarrier = config.ballCarrier || null;
  this.ballRecipient = config.ballRecipient || null;
  this.exchangePoints = config.exchangePoints || []; //[(ball carrier x,y), (recipient x,y)]
  this.carrierDestination = config.carrierDestination || []; //x,y coordinates?
  this.recipientDestination = config.recipientDestination || 0; //Gap number
  this.hasExchanged = config.hasExchanged || false;
};
