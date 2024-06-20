const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let pool = new Schema({
	poolId :{
		type:String ,
		index: true
	},
	reward : {
		type : String,
	
		default : ""
	},
	days :{
		type:String,
		
		default : ""
	},
	rewardtokenaddress : {
		type:String,
		
		default : ""
	},
    isActive : {
        type: Boolean,
        default:true,
    }

},{timestamps:true});
module.exports = mongoose.model('pool',pool,'pool');
