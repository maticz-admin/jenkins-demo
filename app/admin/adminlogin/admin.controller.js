import { catchresponse , sendResponse } from "../../../shared/commonFunction";
import Userschema from '../../user/schema/user.schema' 
import bcrypt from "bcrypt";
import config from '../../../config/config'
import jwt from "jsonwebtoken";
import { userban, userfindby } from "../../user/user.services";
import { AdminfindOne } from "./admin.service";
import { Encryptdata } from "../../../shared/credentialsetup";

export const loginAdmin = async (req, res) => {
    try{
    
      let ReqBody = req.body;
  console.log(ReqBody);
        let checkPassword = ReqBody.password;
        let user = await AdminfindOne({ email: ReqBody.email })
        console.log("sdkhasdoh" , user )
        user = user[0]
        if (user){
          const match = await bcrypt.compare(checkPassword, user.hashpassword);
          if (match) {
            let payload = { "id": user._id}
            let tokenhash = jwt.sign(payload, config.SECRET_KEY)
            const token = `Bearer ${tokenhash}`;
          
           
            res.status(200).json({ status : true ,  "message": "successfully logged in", "data": true, "token": tokenhash })
          }
          else {
            sendResponse(res, 200, "incorrect password", false)
        
          }
    
        } else { 
          sendResponse(res, 200, false, "user not found", false)
           
        }

    }catch(err){
        catchresponse(res , err);
    }

    }

    export const userlist = async (req , res)=>{

        try{
        
        const userdata = await Userschema.find({}, { firstname: 1, lastname: 1, email: 1, phone: 1 , _id : 1})
        
        res.status(200).json(Encryptdata({status : true , message : "user data fetched! " , data : userdata}))
        
        }catch(error){
        catchresponse(res , error)
        }
        
        }
        
        export const userdetail = async(req, res)=>{
        try{
        const {id} = req.body
         // ! userfindby service from user module
        const userdata = await userfindby(id)
        
        // Userschema.find({_id : id }, { firstname: 1, lastname: 1, email: 1, phone: 1 , _id : 1 , refcode : 1 , registered : 1 ,
        //   kycverify : 1 , delete : 1 , userid : 1
        // })
        sendResponse(res , 200 , true , "user data fetched" , userdata)
        
        }catch(error){
            catchresponse(res , error)
        }
        
        }
        
        
        export const Banuser = async(req, res)=>{
          try{
          const {_id , status} = req.body
          // ! userban service from user module 
          const userdata = await userban(_id , status)
            sendResponse(res , 200 , true , "user banned" , userdata)
       
          }catch(error){
            catchresponse(res , error)
          }
          
          }