
import mongoose from  'mongoose';

const Schema = mongoose.Schema;
const userasset = new Schema({

    asset_name : { 
        type: String,
      index : true , 
        default: ""
    },
    assetId : {
        type :  Schema.Types.ObjectId ,
        index : true , 
        ref : 'asset',
    },
    planetId : {
        type :  Schema.Types.ObjectId ,
        index : true , 
        ref : 'planet',
    },
  
    build_Number : {
        type: String,
        index : true , 
          default: ""
    },
    walletAddress : {
        type: String,
        index : true , 
          default: ""
    },
   x : {
    type :   mongoose.Types.Decimal128 ,
    required:true

   },
   y : {
    type :   mongoose.Types.Decimal128 ,
    required:true

   },
   startTime : {
    type: Date,
    default : ""
    },
    endTime : {
    type: Date,
    default : ""
    },
    buildStatus : {
    type: Boolean,
    default : true
    },
    isActive : {
        type: Boolean,
        default : true
    },
  
  
},{timestamps:true})


const userassetdb = mongoose.model("userasset", userasset, "userasset");
export default userassetdb;