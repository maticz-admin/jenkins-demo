import buildingdb from "./schema/building.schema"
import { Finduser } from "../user/user.services"
import { ImageAddFunc } from "../../shared/commonFunction"
import { CreateuserPlanet, UserAssetLevelUp_service, UserAssetList_service, checkexistAsset, checkexistuserAsset, createAsset, createPlanet, createUserAsset_service, findAsset, getPlanetList, updateUserAsset } from "./game.service"
import userPlanetdb from "./schema/userplanet.schema";

/**
 * Creates a build in the database. If a build with the given wallet address and build ID already exists, it updates the existing build.
 *
 * @param {Object} req - The request object containing the build data in the body.
 * @param {Object} res - The response object.
 * @return {Promise<Object>} The response object with a status code, status, message, and data.
 * @throws {Error} If there is an error during the creation or update of the build.
 *  const { name , walletaddress , level , x , y , rows , columns , buildId } = req.body
 */
export const  createBuild = async (req , res )=>{

try{
    let { name , walletAddress , level , x , y , rows , columns , buildId } = req.body

    let  data = req.body
    walletAddress = data?.walletAddress.toLowerCase()
    data.walletAddress = data.walletAddress.toLowerCase()
    const user = await Finduser({WalletAddress : walletAddress })
// console.log("----p>", req.body)
console.log("----p>", data , user)
    if(!user){
        return res.status(404).json({ statusCode : 404 , status : false , message : "user not found" })
    }
   

    data.userID = user?._id;
    const exist = await buildingdb.findOne({ userID : user?._id   , buildId : buildId });

    if(exist){
        console.log("---------->",data , exist , walletAddress , buildId) 
        const update = await buildingdb.findOneAndUpdate({ walletAddress : walletAddress , buildId : buildId } ,
             {x : data.x , y : data.y , rows : data.rows , columns : data.columns , level : data.level }  );
        return res.status(200).json({ statusCode : 200 , status : true , message : "updated" , data : update });
    }

    
    const create = await buildingdb.create(data)
    return res.status(200).json({ statusCode : 201 , status : true , message : "created" , data : create })


}catch(err){
res.status(500).json({ statusCode : 500 , status : false , message : err.message })

}

}
export const UserBuildList = async (req , res )=>{
try{
const walletaddress = req.params.walletaddress.toLowerCase()
console.log("walletaddresxxxs" , walletaddress   )
const data = await buildingdb.find({walletAddress : walletaddress})
res.status(200).json({ statusCode : 200 , status : true , message : 'success'  , data : data })


}catch(err){
    res.status(500).json({ statusCode : 500 , status : false , message : err.message })

}

}

export const addAsset = async (req , res )=>{
try{

const { name , rows , columns , planetId , build_time_min , level } = req.body 
console.log("daogdag" , req.body)
const exist = await checkexistAsset(name , level)
if(exist){
    return res.status(409).json({statusCode : 409 , status : false , message : 'asset already exist with this level and name' })
}

const image = req.files.image
const time=  Date.now()
if(req.files){
  const imagename =   await ImageAddFunc([
        {
          path: `public/gameAssets/`,
          files: req.files.image,
          filename:
          time +
            "." +
            req.files.image.name.split(".")[
              req.files.image.name.split(".").length - 1
            ],
        },
      ])

const payload = {
    asset_name : name ,
    rows : rows, 
    columns : columns,
    image : imagename , 
    planetId : planetId , 
    level : level , 
    build_time_min : build_time_min ,
    image_url : `/gameAssets/${time +
        "." +
        req.files.image.name.split(".")[
          req.files.image.name.split(".").length - 1
        ] }` 

}

const create = await createAsset(payload)
return res.status(200).json({statusCode : 201 , status : true , message : 'Asset created successfully' })

}
return res.status(200).json({statusCode : 200 , status : false , message : 'need image for a asset' })

}catch(err){
    res.status(500).json({ statusCode : 500 , status : false , message : err.message })

}
}

export const AssetByPlanetId = async(req , res )=>{
    try{
const {planetid} = req.body


const data = await findAsset({planetId : planetid})

res.status(200).json({ statusCode : 200 , status : true , message : 'success'  , data : data })

    }catch(err){
        res.status(500).json({ statusCode : 500 , status : false , message : err.message })

    }

}

export const  createUserAsset = async(req , res )=>{
try{
    const { build_Number , walletAddress, planetId , assetId , asset_name , x , y  } = req.body
    const exist = await checkexistuserAsset(build_Number)
    console.log("oo-->" ,exist)
    if(exist){
        const update_positions = {
        x : x ,
        y : y 
        }
        const find = {
        walletAddress : walletAddress.toLowerCase() ,
        build_Number : build_Number
        }
        const updated = await updateUserAsset(find , update_positions)
        return res.status(200).json({ statusCode : 200 , status : true , message : "updated successfully" , data : updated })
    }
    req.body.walletAddress = walletAddress.toLowerCase()

    const create = await createUserAsset_service( req.body)

    res.status(201).json({ statusCode : 201 , status : true , message : "created successfully" , data : create })

}catch(err){
    console.error(err)
        res.status(500).json({ statusCode : 500 , status : false , message : err.message })

}
}

export const UserAssetList = async(req , res )=>{   
try{
const { walletAddress , planetId } = req.query
    const find_data = {
    walletAddress : walletAddress.toLowerCase(), 
    planetId : planetId
    }
    console.log("0000" , find_data)

    const data = await UserAssetList_service(find_data)
    res.status(200).json({statusCode : 200 , status : true , message : 'success' , data : data })
    }catch(err){
    console.log(err)
    res.status(500).json({ statusCode : 500 , status : false , message : err.message })
    }

}

export const UserAssetLevelUp = async(req , res )=>{
try {
     const { build_Number , planetId , assetId  } = req.body
        const {userData , userId} = req
    const find = {
    walletAddress : userData.WalletAddress.toLowerCase() ,
    build_Number : build_Number
    }
    const asstdata = await findAssetbyid(assetId)
    const time = new Date().now()
    const update =  {
    assetId : assetId ,
    startTime : time , 
    endTime : add_minutes(time, asstdata?.build_time_min) ,
    buildStatus : false
    }
    const result  = await UserAssetLevelUp_service(find , update)
    res.status(200).json({ statusCode : 200 , status : result ? true : false , message : result ? 'success': "failed" , data : result })
}catch(error){

        res.status(500).json({ statusCode : 500 , status : false , message : error.message })
}
}


export const PlanetList = async(req , res )=>{
try {
    const result = await getPlanetList()

    res.status(200).json({ statusCode : 200 , status : true  , message : 'fetched' , data : result })

} catch (error) {

    res.status(500).json({ statusCode : 500 , status : false , message : error.message })
    
}

}

export const AddPlanet = async(req , res )=>{
    try {
        const { planetName , description , levelRequirement } = req.body 
      
        const time=  Date.now()
        if(req.files){
          const imagename =   await ImageAddFunc([
                {
                  path: `public/gameAssets/`,
                  files: req.files.image,
                  filename:
                  time +
                    "." +
                    req.files.image.name.split(".")[
                      req.files.image.name.split(".").length - 1
                    ],
                },
              ])
        
        const payload = {
            planetName : planetName ,
          
            description : description,
            image : imagename , 
           
            levelRequirement : levelRequirement , 
           
            image_url : `/gameAssets/${time +
                "." +
                req.files.image.name.split(".")[
                  req.files.image.name.split(".").length - 1
                ] }` 
        
        }
        
        const create = await createPlanet(payload)
        return res.status(200).json({statusCode : 201 , status : true , message : 'Planet created successfully' })
        
        }
        return res.status(200).json({statusCode : 200 , status : false , message : 'need image for a asset' })
        
    
    } catch (error) {
        
        res.status(500).json({ statusCode : 500 , status : false , message : error.message })
        
    }
    
    }

    export const BuyPlanet = async(req , res )=>{
    try{
        const userdb = require('../user/schema/user.schema')
        const { planetId , WalletAddress , userid } = req.body
        const payload = { 

            userId : userid , 
            walletAddress : WalletAddress ,
            planetId : planetId ,
            nftId : planetId , 
            TokenOwnerId : planetId
        }
        const data = await userPlanetdb.create(payload)
       
await userdb.findOneAndUpdate({ _id : userid } , { $push : { planets : data?._id } })

res.status(200).json({ statusCode : 200 , status : true , message : 'buyed successfully' , data : data })
    }catch(err){

        res.status(500).json({ statusCode : 500 , status : false , message : err.message })
    }
    
    }