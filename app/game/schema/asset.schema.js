
import mongoose from  'mongoose';

const Schema = mongoose.Schema;
const asset = new Schema({

    asset_name: { 
        type: String,
      index : true , 
        default: ""
    },
    image : {
        type: String,
        default: ""
    },
    planetId : {
        type :  Schema.Types.ObjectId ,
        index : true , 
        ref : 'planet',
    },
    level : {
        type :   Number ,
        default: ""
       },

   image_url : {
    type :   String ,
    default: ""
   },

   rows : {
        type :  Number ,
        default: null

   },
   columns : {
    type :  Number ,
    default: null

   },
   build_time_min : { // for building build time in minutes
    type :  Number ,
    default: null

   },
    isActive : {
        type: Boolean,
        default : true
    },
  
  
})


const assetdb = mongoose.model("asset", asset, "asset");
export default assetdb;