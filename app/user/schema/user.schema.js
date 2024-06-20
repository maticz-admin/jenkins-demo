import { Schema,model } from "mongoose";
const mongoose = require('mongoose');
const user  =   Schema({

    DisplayName     :   {   type : String , default : ''},
    EmailId         :   {   type : String , default : ''},
    planets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userPlanet' }],
    Youtube         :   {   type : String , default : ''},
    Facebook        :   {   type : String , default : ''},
    Twitter         :   {   type : String , default : ''},
    Instagram       :   {   type : String , default : ''},
    level           :   {   type : Number , default : 1},

    WalletAddress   :   {   type : String , default : ''},
    WalletType      :   {   type : String , default : ''},
    Profile         :   {   type : String , default : ''},
    profile_url     :   {   type : String , default : ''},
    Cover           :   {   type : String , default : ''},
    Bio             :   {   type : String , default : ''},
    CustomUrl       :   {   type : String , default : ''}, 
    Follower        :   {   type    :   Array,default   :   [{
        Address     :   '',
        CustomUrl  :   ''
    }]},
    Following       :   {   type    :   Array,default   :   [{
        Address     :   '',
        CustomUrl  :   ''
    }]},
   
},{timestamps:true})

module.exports = model('user',user)
