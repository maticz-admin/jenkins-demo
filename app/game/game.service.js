import assetdb from "./schema/asset.schema";
import userassetdb from "./schema/userAssets.schema";
import planetdb from "./schema/planet.schema";
import userPlanetdb from "./schema/userplanet.schema";
export const createAsset= async(payload)=>{
    const create = await assetdb.create(payload);
    return create;
}

export const checkexistAsset= async(name , level)=>{
    const create = await assetdb.findOne({asset_name : name , level : level}) 
    return create;
}

export const findAsset= async(data)=>{
    const find = await assetdb.find(data) 
    return find;
}


export const checkexistuserAsset= async(buildnumber)=>{
    const create = await userassetdb.findOne({build_Number : buildnumber}) 
    return create;
}


export const createUserAsset_service= async(payload)=>{
    const create = await userassetdb.create(payload);
    return create;
}
export const updateUserAsset    = async(find , payload)=>{
    const update = await userassetdb.findOneAndUpdate(find , payload ) 
    return update;
}

export const UserAssetList_service= async(find)=>{
    const list = await userassetdb.find(find).populate("assetId", {}).populate("planetId" , {}) 
    return list;
}

export const findAssetbyid= async(id)=>{
    const list = await assetdb.findById(id) 
    return list;
}

export const UserAssetLevelUp_service = async(find , payload)=>{
    const update = await userassetdb.findOneAndUpdate(find , payload ) 
    return update;
}

export const getPlanetList = async()=>{
    const get = await planetdb.find()
    return get;
}
export const createPlanet = async(payload)=>{
    const created = await planetdb.create(payload)
    return created;
}

/**
 * Creates a user planet with the given user data, planet ID, NFT ID, and token owner ID.
 *
 * @param {Object} userData - The user data object.
 * @param {string} planetId - The ID of the planet.
 * @param {string} nftId - The ID of the NFT.
 * @param {string} TokenOwnerId - The ID of the token owner.
 * @return {Promise<void>} - A promise that resolves when the user planet is created.
 */
export async function CreateuserPlanet(userData , planetId , nftId , TokenOwnerId){

const payload = { 

    userId : userData?._id , 
    walletAddress : userData?.WalletAddress ,
    planetId : planetId ,
    nftId : nftId , 
    TokenOwnerId : TokenOwnerId
}
const created = await userPlanetdb.create(payload)
return created;
}
export async function CreateuserPlanetfordemo(userData , planetId , nftId , TokenOwnerId){

    const payload = { 
    
        userId : userData?._id , 
        walletAddress : userData?.WalletAddress ,
        planetId : planetId ,
        nftId : nftId , 
        TokenOwnerId : TokenOwnerId
    }
    const created = await userPlanetdb.create(payload)
    return created;
    }