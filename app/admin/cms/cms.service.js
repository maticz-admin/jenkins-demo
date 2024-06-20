import cmsschema from './schema/cms.schema';
import roadmapschema from './schema/roadmap.schema';
import faqschema from './schema/faq.schema';
import planetSchema from './schema/planet.schema';
import { catchresponse , sendResponse } from '../../../shared/commonFunction';
import fs from 'fs'
import { FindOneandupdate } from '../../../shared/mongoosehelper';
import poolDb from './schema/pool.schema'
import currencydb from "./schema/currency.schema";
const path = require('path')

export const FaqFindall = async () => {
 
    return  await faqschema.find({})
  

  }

  export const FaqUpdate=  async (id , question , answer)=>{
   
   
        return await faqschema.findOneAndUpdate({_id : id },{ "question": question ,  "answer": answer })
  }

  export const Faqcreate = async (payload) => {
    return await faqschema.create(payload)
  }


  export const FaqDelete = async (id) => {
    return await faqschema.findOneAndDelete({ _id : id })
  }


  export const FindOnecms = async (data) => {
   return  await cmsschema.findOne(data)
  }

  export const FindOnecmsandUpdata = async(find , update , save)=>{
    return await FindOneandupdate(cmsschema , find , update , save)
  
  } 
export const FindByidcmsandUpdate = async( id , heading , description )=>{
    return await cmsschema.findByIdAndUpdate(id ,{ "heading" : heading , "description" : description}) 

}

export const findroadmap = async()=>{
 return await roadmapschema.find();
}

export const FindByidroadmapandUpdate = async( id , question , answer )=>{
    return await roadmapschema.findByIdAndUpdate(id , { "question": question ,  "answer": answer });
}

export const allcms = async()=>{
  
const roadmap = await roadmapschema.find();
const cms = await cmsschema.find();
const faq = await faqschema.find();
const planet = await planetSchema.find();
const result = { 
  roadmapdata : roadmap , 
  cmsdata : cms , 
  faqdata : faq,
  planetdata : planet
}

return result 
}



export const PoolListService = async()=>{
const data =   await poolDb.find()
return data 
}

export const PoolUpdateService = async(id , payload )=>{
   const data = await poolDb.findByIdAndUpdate(id , payload )
   return data
}

export const PoolhideService   = async(id)=>{
  const exist = await poolDb.findById(id)
  const data = await poolDb.findByIdAndUpdate(id , {isActive : !exist.isActive} )
  return data
}

export const PoolCreate = async (data)=>{
  const result = await poolDb.create(data)
  return result
}

export const createcurrency  = async (data)=>{
const res = await currencydb.create(data)
return res
}

export const checkcurencyexist_service = async(id)=>{
  const res = await currencydb.findById(id)
  return res
}

export const get_cuurencyList_Service = async()=>{
  return  await currencydb.find()
} 