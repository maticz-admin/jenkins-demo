import userSchema from "./schema/user.schema";
import {FindDocument , SaveDocument , FindOneandupdate} from  '../../shared/mongoosehelper'
import subscribe from './schema/subcriber.schema'
import activityschema from './schema/activity.schema'
import usercurrencydb from "./schema/usercurrency.schema";
export const Finduser = async(data,select)=>{
    return await FindDocument(userSchema , data , select)
} 
export const Findgameuser = async(data,select)=>{
  // return await userSchema.findOne(data).select(select).populate("planets" , { } , "planetId" , {  })

  return await userSchema.findOne(data).select(select).populate({
    path : "planets",
    select : {},
    populate : {
      path : "planetId",
      select : {}
    }
  })

} 
export const FinduserById = async(data)=>{
  return await userSchema.findById(data)
}

export const SaveUser = async(data)=>{
    return await SaveDocument(userSchema , data );
}

export const getdisplaynameandcustomurl = async( userid, userdisplayname , userurl)=>{
  
  return await userSchema.findOne( {$or : [{_id : { $ne : userid  } , DisplayName : userdisplayname } , {_id : { $ne : userid  } , CustomUrl : userurl }   ]})
}
export const SaveNewsletter = async(data)=>{
    return await SaveDocument(subscribe , data )
}

export const FindNewsletter = async(data , select)=>{
    return await FindDocument(subscribe , data , select)
}
export const FindAllNewsletter = async()=>{
  return await subscribe.find()
}

export const  FindUserandUpdate =async(find , update )=>{
    return FindOneandupdate(userSchema , find ,update )
} 


export const FindNotification = async(address , skip)=>{
    const query = [
        {
          $match: {
            $expr: {
              $or: [
                { $eq: ["$To", address] },
                { $eq: ["$From", address] }
              ]
            }
          }
        },{
          $sort: {
            createdAt: -1
          }
        },
        {
          $match: {
            $expr: {
              $or: [
                {
                  $and: [
                    { $eq: ["$From", address] },
                    { $eq: ["$Activity", "Buy"] }
                  ]
                },
                {
                  $and: [
                    { $eq: ["$To", address] },
                    { $in: ["$Activity", ["EditBid", "Bid", "Accept", "Transfer"]] }
                  ]
                }
              ]
            }
          }
        },{
          $lookup: {
            from: "users",
            localField: "To",
            foreignField: "WalletAddress",
            as: "tousers"
          }
        },{ $unwind : "$tousers"
      },{
          $lookup: {
            from: "users",
            localField: "From",
            foreignField: "WalletAddress",
            as: "fromusers"
          }
        },{ $unwind : "$fromusers"
      },
        {
          $lookup: {
            from: "tokens",
            localField: "NFTId",
            foreignField: "NFTId",
            as: "tokendetails"
          }
        }, { $unwind : "$tokendetails"
        },{
          $skip: ((skip ? parseInt(skip) : 1) - 1 ) * 10 , // Replace with the number of documents to skip
        },
        {
          $limit: 10, // Replace with the number of documents to return
        }
      ]
    
return await  activity.aggregate(query)

}


export const SaveActivity = async (data) => {
  const { Activity, From, To } = data;
  if (
    Activity === "Follow" ||
    Activity === "UnFollow" ||
    Activity === "Like" ||
    Activity === "DisLike"
  ) {

    let finddata = { From: From, To: To } 
    let update = { $set: data }
    let save = { new: true }
   await activityschema.FindOneandupdate(finddata , update , save)
    
  } else {
    const { Data } = data;

      let saveData = new activityschema(Data);
      let FinOnUData = await saveData.save();
    // activityschema.
    // var SenVal = { DBName: ActivitySchema, Data: data };
    // var chk = await Save(SenVal);
  }
};

// services for userseach in nft controller 

export const userseachservice = async(data)=>{
  const {  finddata, selectdata, limit, skip } = data;
  let result =""
  if(limit){
    result  = await userSchema.find(finddata, selectdata)
    .skip(skip)
    .limit(limit);
  }else{
    result = await userSchema.find(finddata, selectdata);
  }

return { status : result ? true : false , data : result ? result : null}


}

export const userban = async(_id , status)=>{
 return  await userSchema.findOneAndUpdate({_id : _id }, { delete : status} )

}
export const userfindby = async(id)=>{
  return await userSchema.findById(id)
}

export const getBalance = async(address)=>{
const bal = await usercurrencydb.find({walletAddress : address}).populate("currencyId", {})
return bal
}

export const addbalace = async(data)=>{
const created = await usercurrencydb.create(data)
return created
}

export const creteMultipleusercurrency = async(data)=>{
  const created = await usercurrencydb.insertMany(data)
  return created
}

export const findinuserCurrency = async(data)=>{
  const find = await usercurrencydb.find(data)
  return find
}