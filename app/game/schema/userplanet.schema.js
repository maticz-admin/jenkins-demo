const mongoose = require('mongoose');


const userPlanet = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planetId: { type: mongoose.Schema.Types.ObjectId, ref: 'planet', required: true },
    unlockedAt: { type: Date, default: Date.now },
    walletAddress : {
    type : String,
    require : true
    },
    nftId : {
        type: mongoose.Schema.Types.ObjectId, ref: 'tokens', required: true 
    },
    TokenOwnerId : {
        type: mongoose.Schema.Types.ObjectId, ref: 'tokenowners', default : "" 
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  const userPlanetdb = mongoose.model('userPlanet', userPlanet);
  module.exports = userPlanetdb;
  
  
//   [ {  name : kamesh , planetName : {} }, {} , {} ]