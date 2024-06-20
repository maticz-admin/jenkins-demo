
import mongoose from  'mongoose';

const Schema = mongoose.Schema;

const building = new Schema({

    name: {
        
        type: String,
        required:true
    },
    buildId : {
        type: String,
        index: true ,
        required:true
    },
    level : {
        type: Number,
        required:true
    },
   x : {
    type :   mongoose.Types.Decimal128 ,
    required:true

   },
   y : {
    type :   mongoose.Types.Decimal128 ,
    required:true

   },
   rows : {
    type :  Number ,
    required:true

   },
   columns : {
    type :  Number ,
    required:true

   },
   walletAddress : {
    type :  String ,
    index: true,
    required:true
    
   },
   userID : {
    type :  Schema.Types.ObjectId ,
    ref : 'user',
    index: true,
    required:true
   },
    isActive : {
        type: Boolean,
        default : true
    },
  
  
})


const buildingdb = mongoose.model("building", building, "building");
export default buildingdb;