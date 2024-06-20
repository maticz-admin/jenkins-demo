const mongoose = require('mongoose');

const worldSchema = new mongoose.Schema({
  planetName: { type: String, required: true },
  description: { type: String },
  image : { type: String },
  image_url : { type: String },
  levelRequirement: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const planetdb = mongoose.model('planet', worldSchema);
module.exports = planetdb;