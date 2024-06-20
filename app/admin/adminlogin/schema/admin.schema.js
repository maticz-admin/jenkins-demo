
import mongoose from  'mongoose';

const Schema = mongoose.Schema;

const AdminSchema = new Schema({

    email: {
        
        type: String,
        required:true
    },
    password : {
        
        type: String,
        required:true
    },
    hashpassword:{
        type: String,
        required:true
    }
  
})


const Admin = mongoose.model("admin", AdminSchema, "admin");
export default Admin;