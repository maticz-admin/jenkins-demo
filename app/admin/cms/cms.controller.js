import { catchresponse , sendResponse } from "../../../shared/commonFunction"
import { FindAllNewsletter } from "../../user/user.services"
import * as cmsservice  from "./cms.service"
const Currency = require('./schema/currency.schema')


export const FaqList = async (req, res) => {
  try{
    const resp = await cmsservice.FaqFindall() 
    console.log(resp)
      sendResponse(res, 200, true, "success", resp)


  }catch(error){
  catchresponse(res , error)

  }
}

export const FaqUpdate = async (req, res) => {
  try {
    const {id , question , answer}= req.body  
    const resp = await  cmsservice.FaqUpdate(id , question , answer)
    sendResponse(res, 200, true, "success", resp)
  } catch (error) {
    catchresponse(res , error)
  }
}


export const FaqAdd =  async (req , res )=>{
  try{
      const {question , answer}= req.body
      const  payload = {
          "question": question,
          "answer": answer
        }
    
    const save = await cmsservice.Faqcreate(payload)
    return sendResponse(res, 200, true, "success", save)
    
  }catch(error){
    catchresponse(res , error)

  }

}

export const FaqDelete =  async (req , res )=>{
  try{ 
  const {id}= req.params
  await cmsservice.FaqDelete({ _id : id })
  sendResponse(res, 209, true,"deleted successfully")
  }catch(error){
    catchresponse(res  , error)
  }

}

export const CmsUpdate = async(req, res)=>{
  try{
  const {id , key , heading , description   } = req.body
  if(req?.files?.cmsimage){
  const files = req?.files?.cmsimage
  let fileName=Date.now()+".webp"
  const uploadPath = path.join(__dirname, `../../public/cms`, fileName);
  let test = await fs.promises.mkdir(path.resolve(__dirname, `../../public/cms`),{recursive:true})
  files.mv(uploadPath, async (err) => {
  if (err) {
    console.error('Error uploading profile image:', err);
    return res.status(500).json({ success: false, message: 'Error uploading  image' });
  }

 const resp = await cmsservice.FindOnecmsandUpdata({_id : id } ,{"description":req.body.description,"heading":req.body.heading, "image" : fileName} )
sendResponse(res , 200 , true , "cms uploaded successfully" , resp)
});
}else{
  const data = await cmsservice.FindByidcmsandUpdate(id , heading , description)

sendResponse(res , 200 , data ? true : false   ,data? "updated!" : "failed to update!" )


}
  }catch(error){
  catchresponse(res ,  error)

  }

}


export const CmsDetails = async(req, res)=>{
  try{ 
  const  key  = req.query.data
console.log(key)
  const resp = await cmsservice.FindOnecms({ slug : key}) 


sendResponse(res , 200 , true , "cms fetched" , resp) 

}catch(error){
  catchresponse(res , error)

}

}

export const Subcribelist = async (req, res )=>{
  try{
    // !FindAllNewsletter service from user module 
  const save = await FindAllNewsletter()

  console.log(save)
  sendResponse(res, 200, true, "success", save)
  
  }catch(error){
    catchresponse(res ,  error)
  }
    }


      export const RoadmapList = async (req, res) => {
    try{
    const resp = await cmsservice.findroadmap()
      console.log(resp)
    sendResponse(res, 200, true, "Roadmap fetched successfully", resp);

    }catch(error){
    catchresponse(res , 500 , false , error)
    }
  }


  export const RoadmapUpdate =  async (req , res )=>{

try{
    const {id , question , answer} = req.body
    const resp = await cmsservice.FindByidroadmapandUpdate(id , question , answer );
  
  if(resp){
    sendResponse(res, 200, true, "Faq edited successfully!")
  }else{
    sendResponse(res,200, false , "Failed to edit!")
  }
}catch(error){
    catchresponse(res ,error)
}

  }


  export const planetlist = async(req , res )=>{
try {
  const  planet = require('./schema/planet.schema')
const create = await planet.find()
    sendResponse(res , 200 , true, "fetched" , create)
} catch (error) {
  catchresponse( res ,error)
}

  }

  export const planetupdate = async(req , res )=>{
    try {
      
   console.log(req.body)
    const  planet = require('./schema/planet.schema')
    const {_id , data }= req.body
    const updatedvalue = await planet.findByIdAndUpdate(_id , data )
    sendResponse(res, 200 , updatedvalue ? true : false ,updatedvalue ? "update successfully" : "failed to update" , updatedvalue)
  } catch (error) {
   catchresponse(res , error)   
  }

  }

  export const cmslist = async(req , res )=>{
    try{
     
        const results = await cmsservice.allcms();
     

        sendResponse(res , 200 , true , "success" , results)

    }catch(error){
        catchresponse(res , error)
    }
  }



  export const getCurrencyList = async (req, res) => {
try{



   let List = await Currency.find().select({_id : 0 })

   

   sendResponse(res , 200 , true , "success" , List)


}catch(error){
  catchresponse(res , error)
}
  
  }

export const PoolList = async (req, res) => {
  try{
  const result = await cmsservice.PoolListService();

  sendResponse(res , 200 , true , "success" , result)
  }catch(err){
  catchresponse(res , err)
}

}


export const Poolupdate = async (req, res) => {
  try{
    const {id , payload  } = req.body

  const result = await cmsservice.PoolUpdateService(id , payload);

  sendResponse(res , 200 , result ? true : false  ,result ?  "update successfully" : 'update failed' , result)

  }catch(err){
  catchresponse(res , err)
}
}

export const PoolHide = async (req, res) => {
  try{
    const id   = req.body

    console.log(id , "deeeeeeahhasj")
  const result = await cmsservice.PoolhideService(id);

  sendResponse(res , 200 , result ? true : false  ,result.isActive ?  "pool Activated " : 'pool deactivated' , result)

  }catch(err){
  catchresponse(res , err)
}
}

export const PoolCreate = async (req, res) => {
  try{
    const data   = req.body
    console.log("PoolCreate",req.body)
  const result = await cmsservice.PoolCreate(data);

  sendResponse(res , 200 , result ? true : false  ,result ?  "update successfully" : 'update failed' , result)

  }catch(err){
  catchresponse(res , err)
}
}
export const createcurrency = async (req, res) => {
  try{
    const data   = req.body
    console.log("createcurrency",req.body)
  const result = await cmsservice.createcurrency(data);
  res.status(200).json({ status : result ? true : false ,message : result ?  "created successfully" : 'failed' , data:result})
  }catch(err){
    catchresponse(res , err)

  }
}