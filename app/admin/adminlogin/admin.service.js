import AdminSchema from "./schema/admin.schema";
import jwt from "jsonwebtoken";
import Config from '../../../config/config'
export const Authendicateadmin = async (req, res, next) => {
    try {
        if(!req.headers.authorization){
            return res.status(422).json({status : false , message:"Please send validate token."})
        }

            req.headers.authorization = req?.headers?.authorization.replace("Bearer ","")
        
            
            const decoded = await jwt.verify(  req.headers.authorization, Config.SECRET_KEY);
            console.error("ssssssssssssssssssss",decoded  )
            if(decoded.id){
                const data = await AdminSchema.findById({ _id : decoded.id })
                console.log(data)
                if(data){
                    next()
                }else{
                    return res.status(422).json({status : false , message:"UnAuthorized token!"})
                }
        
            }
    } catch (error) {
        console.error(error)
        return res.status(500).json({status : false , message: error})
    }
    
    
    }


    export const AdminfindOne = async(Query)=>{

      const data =  await AdminSchema.find(Query)
       return data
    }