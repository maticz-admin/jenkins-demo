import {Schema,model} from 'mongoose'

// const currency  =   new Schema({
//     CurrencyDetails       :   {   type : Array , default : []},
// },{timestamps:true})


const currency  =   new Schema(
    {
         label: {
            type: String,
            default : "",
            unique: true,
        },
        value : {
            type: String,
            default : ""
        },
        decimal: {
           type: String,
           default : ""
        },
        address : {
           type: String ,
           default : ""
        },
        deleted : {
           type: Boolean,
           default : false 
        }
},{timestamps:true})



module.exports = model('currency',currency)