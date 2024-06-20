const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let cms = new Schema({
	heading:{
		type:String ,
		index: true
	},
	description : {
		type : String,
		index: true,
		default : ""
	},
	slug:{
		type:String,
		index: true,
		required:true,
	},
	deleted : {
		type: Boolean,
		default:false,
	},
	image : {
		type : String,
		default :""
	}
},{timestamps:true});
module.exports = mongoose.model('cms',cms,'cms');
