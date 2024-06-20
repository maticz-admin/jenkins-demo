import { FindNewsletter,getBalance, Finduser , SaveNewsletter , SaveUser , FindNotification, getdisplaynameandcustomurl, FindUserandUpdate, addbalace, Findgameuser, creteMultipleusercurrency, findinuserCurrency } from "./user.services";
import { sendResponse , catchresponse , isEmpty, ImageAddFunc, sendRes } from "../../shared/commonFunction";
import { Encryptdata, JWT_SIGN } from "../../shared/credentialsetup";
import { checkcurencyexist_service, get_cuurencyList_Service } from "../admin/cms/cms.service";
import { Token_Balance_Calculation } from "../../shared/contract";
export const UserRegister = async(req , res )=>{
try {
  

const {
  Type,
  WalletAddress,
  WalletType,
  EmailId,
  DisplayName,
  Profile,
  Cover,
  Youtube,
  Facebook,
  Twitter,
  Instagram,
  Bio,
  CustomUrl
} = req.body;
const time = Date.now()
let prfilename =''
var profile = req?.files?.Profile
// if (req.files) {


//    prfilename = time +
// "." +
// req?.files?.Profile?.name.split(".")[
//   req?.files?.Profile.name.split(".").length - 1
// ]


//     ? await ImageAddFunc([
//         {
//           path: `public/user/${WalletAddress}/profile/`,
//           files: req.files.Profile,
//           filename:
//           time +
//             "." +
//             req.files.Profile.name.split(".")[
//               req.files.Profile.name.split(".").length - 1
//             ],
//         },
//       ])
//     : null;
//   var cover = req?.files?.Cover
//     ? await ImageAddFunc([
//         {
//           path: `public/user/${WalletAddress}/cover/`,
//           files: req?.files?.Cover,
//           filename:
//           time  +
//             "." +
//             req.files?.Cover?.name.split(".")[
//               req.files?.Cover.name.split(".").length - 1
//             ],
//         },
//       ])
//     : null;
// }


const saveData = {
  DisplayName: DisplayName,
  EmailId: EmailId,
  Youtube: Youtube,
  Facebook: Facebook,
  Twitter: Twitter,
  Instagram: Instagram,
  Bio: Bio,
  CustomUrl: CustomUrl ? CustomUrl : WalletAddress,
  profile_url: req?.files?.Profile ?  `/user/${WalletAddress}/profile/${prfilename}` : '',
  Profile : '',
  Cover: '',
  WalletAddress: WalletAddress,
  WalletType: WalletType,
};

        const findcustom = { DisplayName : DisplayName}
        const FinData = { WalletAddress: WalletAddress };

        const select = { DisplayName : 1 , CustomUrl: 1, EmailId: 1 }
        const customExits =    await Finduser(findcustom , select )
        const FinDatacus = { CustomUrl: saveData.CustomUrl };
        const customExitscustomurl  =   await Finduser(FinDatacus , select )

if(customExits){
  if (customExits.DisplayName) {
    return sendResponse(res , 409 , false ,"displayname already exist" );
  }
   if(customExitscustomurl.CustomUrl){
   return  sendResponse(res , 409 , false ,"custom url already exist" );
  }
}
    


        const savedata = await SaveUser(saveData)
        const token = JWT_SIGN(savedata?._id);
        if (savedata) {
        const Usercurrency = await  createCurrencyforuser(saveData?.WalletAddress , savedata?._id )
        const cuurencydata = await findinuserCurrency({WalletAddress : savedata?.WalletAddress})
       
          res.status(201).json(
            Encryptdata( {
              status: true ,
              data: savedata ,
              token : token,
              usercuurency : cuurencydata,
              message : `connected successfully`,
            })
          );
        } else {
          sendResponse(res , 400 , false ,"can't create user profile");
   
        }
      
      } catch (error) {
        console.error(error);
        catchresponse(res , error);
      }

}
export const CreateGameUser = async(req , res )=>{
  try {
    
  
  const {
    Type,
    WalletAddress,
    WalletType,
    EmailId,
    DisplayName,
    Profile,
    Cover,
    Youtube,
    Facebook,
    Twitter,
    Instagram,
    Bio,
    CustomUrl
  } = req.body;
  const time = Date.now()
  let prfilename =''
  var profile = req?.files?.Profile

  
  
  const saveData = {
    DisplayName: DisplayName,
    EmailId: EmailId,
    Youtube: Youtube,
    Facebook: Facebook,
    Twitter: Twitter,
    Instagram: Instagram,
    Bio: Bio,
    CustomUrl:  WalletAddress,
    profile_url: req?.files?.Profile ?  `/user/${WalletAddress}/profile/${prfilename}` : '',
    Profile : '',
    Cover: '',
    WalletAddress: WalletAddress.toLowerCase( ),
    WalletType: WalletType,
  };
  
          const findcustom = { DisplayName : DisplayName}
          const FinData = { WalletAddress: WalletAddress };
  
          const select = { DisplayName : 1 , CustomUrl: 1, EmailId: 1 }
          const customExits =    await Finduser(findcustom , select )
          const FinDatacus = { CustomUrl: saveData.CustomUrl };
          const customExitscustomurl  =   await Finduser(FinDatacus , select )
  
  if(customExits){
    if (customExits.DisplayName) {
     return  res.status(409).json(
        {
          statusCode : 409 ,
          status : false ,
          message : "displayname already exist"
        }
      )
    }
 
  }
  const walletExits =    await Finduser(FinData , {} )

   if(walletExits){
      const token = JWT_SIGN(walletExits?._id);

     return  res.status(200).json(
        {
         status: true ,
         data: walletExits ,
         token : token,
         message : `connected successfully`,
       }
     );
    }
      // 
     //  if(customExitscustomurl.CustomUrl){
    //  return  sendResponse(res , 409 , false ,"custom url already exist" );
   // }


  console.log("sdahdigas" , saveData , req.body)
  
          const savedata = await SaveUser(saveData)
          const token = JWT_SIGN(savedata?._id);
          if (savedata) {
          const da =   await Finduser({WalletAddress : savedata?.WalletAddress} , { WalletAddress : 1 
          ,DisplayName : 1 , planets : 1 , level : 1
          } )
        const Usercurrency = await  createCurrencyforuser(saveData?.WalletAddress , savedata?._id )
         
        res.status(201).json(
               {
                status: true ,
                data: da ,
                token : token,
                message : `Created successfully`,
              }
            );
          } else {
            res.status(400).json( { statusCode : 400 ,status : true , message : "can't create user profile" });
         
     
          }
        
        } catch (error) {
          console.error(error);
          catchresponse(res , error);
        }
  
  }
export const Editprofile = async(req , res )=>{
  try {
    
  const {userId } = req
  const {
    WalletAddress,
    EmailId,
    DisplayName,
    Youtube,
    Facebook,
    Twitter,
    Instagram,
    Bio,
    CustomUrl,
    Profile,
    Cover,
  } = req.body;
const time=  Date.now()
  if (req.files) {
    var profile = req?.files?.Profile
      ? await ImageAddFunc([
          {
            path: `public/user/${WalletAddress}/profile/`,
            files: req.files.Profile,
            filename:
            time +
              "." +
              req.files.Profile.name.split(".")[
                req.files.Profile.name.split(".").length - 1
              ],
          },
        ])
      : null;
    var cover = req?.files?.Cover
      ? await ImageAddFunc([
          {
            path: `public/user/${WalletAddress}/cover/`,
            files: req.files.Cover,
            filename:
            time  +
              "." +
              req.files.Cover.name.split(".")[
                req.files.Cover.name.split(".").length - 1
              ],
          },
        ])
      : null;
  }

  const saveData = {
    DisplayName: DisplayName,
    EmailId: EmailId,
    Youtube: Youtube,
    Facebook: Facebook,
    Twitter: Twitter,
    Instagram: Instagram,
    Profile : req?.files?.Profile ?  profile : Profile,
    profile_url: req?.files?.Profile ?  `/user/${WalletAddress}/profile/${time +
      "." +
      req.files.Profile.name.split(".")[
        req.files.Profile.name.split(".").length - 1
      ] }` : '',
    Cover: cover ?? Cover,
    Bio: Bio,
    CustomUrl: CustomUrl ? CustomUrl : WalletAddress,
   
  };
  
          const findcustom = { DisplayName : DisplayName}
          const FinData = { WalletAddress: WalletAddress };
  
          const select = { DisplayName : 1 , CustomUrl: 1, EmailId: 1 , WalletAddress : 1  }
          const customExits =    await Finduser(FinData , select )
         
          const customExitscustomurl  =   await getdisplaynameandcustomurl(userId ,saveData?.DisplayName , saveData?.CustomUrl )

  
  if(!customExits){
    return sendResponse(res , 409 , false ,"create profile" );
  }
  
  if(customExitscustomurl){
    if (customExitscustomurl.DisplayName === saveData?.DisplayName ) {
      return sendResponse(res , 409 , false ,"displayname already exist" );
    }
     if(customExitscustomurl.CustomUrl === saveData?.CustomUrl ){
     return  sendResponse(res , 409 , false ,"custom url already exist" );
    }
  }
      
  
  const savedata = await  FindUserandUpdate({ WalletAddress: WalletAddress } , saveData)
          // const savedata = await SaveUser(saveData)
          const token = JWT_SIGN(savedata?._id);
          if (savedata) {
    
            res.status(201).json(
              Encryptdata( {
                status: true ,
                data: savedata ,
                token : token,
                message : `updated successfully`,
              })
            );
          } else {
            sendResponse(res , 400 , false ,"can't update");
     
          }
        
        } catch (error) {
          console.error(error);
          catchresponse(res , error);
        }
  
  }
  

export const InitialConnect = async (req, res) => {
  try {
    const {
      WalletAddress,
      WalletType,
    } = req.body;
      let FinData = {} 
    
  
      if (!isEmpty(WalletAddress)) {
        FinData = { WalletAddress : WalletAddress };
      } else {
       return sendResponse(res,200 ,false ,"WalletAddress Empty");
        
      }
    
      if (!isEmpty(FinData)) {
       const user = require('../user/schema/user.schema')
        const FIndAlreadyExits = await Finduser(FinData);
        const FIndAlreadyExitsid = await user.find({ WalletAddress : WalletAddress });
    

        if (FIndAlreadyExits) {
       
          const token = JWT_SIGN(FIndAlreadyExits?._id);
          // res.status(200).json(
          //   Encryptdata({
          //     status: true,
          //     data: FIndAlreadyExits,
          //     token: token,
          //     message : `Wallet connected successfully`,
          //   })
          // );

          return  res.status(200).json(Encryptdata(
            {
              status: true,
              data: FIndAlreadyExits,
              token: token,
              message : `Wallet connected successfully`,
            })
          );
        }else{
          return sendResponse(res, 200 , false , "createaccount");
        } 
        
 
      
    } else{
      return sendResponse(res, 200 , false , "createaccount");
    }
    
  } catch (error) {
    catchresponse(res,error);
  }
}
export const GameConnect = async (req, res) => {
  try {
    const {
      WalletAddress,
      WalletType,
    } = req.body;
      let FinData = {} 
    
  
      if (!isEmpty(WalletAddress)) {
        FinData = { WalletAddress : WalletAddress };
      } else {
       return sendRes(res,200 ,false ,"WalletAddress Empty");
        
      }
    
      if (!isEmpty(FinData)) {
      
        const FIndAlreadyExits = await Findgameuser(FinData , { WalletAddress : 1 , DisplayName : 1 , planets: 1 , level : 1 });
   
    

        if (FIndAlreadyExits) {
       
          const token = JWT_SIGN(FIndAlreadyExits?._id);
    
          const currencydata = await findinuserCurrency({ walletAddress : WalletAddress })

          return  res.status(200).json(
            {
              statusCode : 200,
              status: true,
              data: FIndAlreadyExits,
              token: token,
              message : `Wallet connected successfully`,
              usercurrency : currencydata
            }
          );

        }else{
          return sendRes(res, 200 , false , "createaccount");
        } 
        
 
      
    } else{
      return sendRes(res, 200 , false , "createaccount");
    }
    
  } catch (error) {
    catchresponse(res,error);
  }
}
export const getprofile = async(req , res )=>{
  try{
    const {CustomUrl} = req.params;
    let FinData = {}
      if (!CustomUrl) {
        return sendResponse(req , 200 , false ,"custom url empty" );
      } 
    
      FinData = { CustomUrl: CustomUrl };
    
    
    const FIndAlreadyExits = await Finduser(FinData)
    
    if (FIndAlreadyExits) {
    
    
    res.status(200).json(
    Encryptdata({
     
      data: FIndAlreadyExits,
      status: true,
      message: `connected successfully`,
    })
    );
    
    } else {
    res.status(404).json(Encryptdata({ status: false , message: "User Not Found" }));
    }
    
  }catch(err){

  }

}

// profile image upload 
export const profileimage = async (req , res )=>{
try {
    const {
        WalletAddress,
        Profile,
        Cover,
      } = req.body;
      const{ userData} = req
    let profile =""
    let cover =""
    if (req.files) {
         profile = req?.files?.Profile
          ? await ImageAddFunc([
              {
                path: `public/user/${WalletAddress}/profile/`,
                files: req.files.Profile,
                filename:
                  Date.now() +
                  "." +
                  req.files.Profile.name.split(".")[
                    req.files.Profile.name.split(".").length - 1
                  ],
              },
            ])
          : null;
         cover = req?.files?.Cover
          ? await ImageAddFunc([
              {
                path: `public/user/${WalletAddress}/cover/`,
                files: req.files.Cover,
                filename:
                  Date.now() +
                  "." +
                  req.files.Cover.name.split(".")[
                    req.files.Cover.name.split(".").length - 1
                  ],
              },
            ])
          : null;
      }

      const saveData = {
        Profile : req?.files?.Profile ?  profile : Profile,
        Cover: cover ? cover : Cover,

      };

    const FinData = { WalletAddress: userData.WalletAddress };

    const Finddata = await FindUserandUpdate(FinData , { Profile: saveData.Profile }  );
if(Finddata){

    return sendResponse(res, 201 , true ,"Profile Image Updated Successfully" ,Finddata )  

}
return sendResponse(res, 409 , false ,"updation failed" , Finddata)  

    
} catch (error) {
    catchresponse(res , error); 
}


}


export const coverimage = async (req , res )=>{
  try {
      const {
          WalletAddress,
          Profile,
          Cover,
    
        } = req.body;
        const{ userData} = req
      let profile =""
      let cover =""
      if (req.files) {
           profile = req?.files?.Profile
            ? await ImageAddFunc([
                {
                  path: `public/user/${WalletAddress}/profile/`,
                  files: req.files.Profile,
                  filename:
                    Date.now() +
                    "." +
                    req.files.Profile.name.split(".")[
                      req.files.Profile.name.split(".").length - 1
                    ],
                },
              ])
            : null;
           cover = req?.files?.Cover
            ? await ImageAddFunc([
                {
                  path: `public/user/${WalletAddress}/cover/`,
                  files: req.files.Cover,
                  filename:
                    Date.now() +
                    "." +
                    req.files.Cover.name.split(".")[
                      req.files.Cover.name.split(".").length - 1
                    ],
                },
              ])
            : null;
        }
  
        const saveData = {
          CustomUrl: CustomUrl ? CustomUrl : WalletAddress,
          Profile : req?.files?.Profile ?  profile : Profile,
          Cover: cover ?? Cover,
      
        };
  
      const FinData = { WalletAddress: userData.WalletAddress };
  
      const Finddata = await FindUserandUpdate(FinData , { Cover: saveData.Cover }  );
  if(Finddata){
  
      return sendResponse(res, 201 , true ,"cover image updated successfully" ,Finddata )  
  
  }
  return sendResponse(res, 409 , false ,"updation failed" , Finddata)  
  
      
  } catch (error) {
      catchresponse(res , error); 
  }
  
  
  }

/**
 *
 * @param {    "ClickAddr": "0xea4fe72960c36ca7a9f4e6a107fdfe07a952704e",
*           "ClickCustomUrl": "kamesh11",
*          "From": "myitem",
*          "MyItemAddr": "0x69ebd648b36b2b3d8f22a998ec9edf9df2737190",
*          "MyItemCustomUrl": "test111"
*     } req
* @param { this function is used to Follow and un-follow the user   } res
* @usage   create
* @TYPE : POST
* @URL : http://localhost:3331/v1/front/user/FollowUnFollow
* @Date : 19/12/2023
*/

export const FollowUnFollow = async (req, res) => {
  try {
    const { MyItemAddr, ClickAddr, MyItemCustomUrl, ClickCustomUrl } = req.body;
    if (MyItemAddr && ClickAddr) {
      const update = {
        $pull: { Follower: { Address: ClickAddr, CustomUrl: ClickCustomUrl } },
        };
        
      const finVal =
            { WalletAddress: MyItemAddr ,
             CustomUrl: MyItemCustomUrl ,
              Follower: {
                $elemMatch: { Address: ClickAddr, CustomUrl: ClickCustomUrl },
              }
        }
  
      const Find = await FindUserandUpdate( finVal , update);

      if (Find) {
  
        const update_following = {
          $pull: {
            Following: { Address: MyItemAddr, CustomUrl: MyItemCustomUrl },
          },
        };

        const finVal_following= {
             WalletAddress: ClickAddr ,
            CustomUrl: ClickCustomUrl ,
              Following: {
                $elemMatch: {
                  Address: MyItemAddr,
                  CustomUrl: MyItemCustomUrl,
                },
        }
        }
        const Find_following = await FindUserandUpdate ( finVal_following , update_following) 
        
  

        if (Find_following) {
          return sendResponse(res , 200 , true , "unfollow")
        }

      } else {
        const update = {
          $push: {
            Follower: { Address: ClickAddr, CustomUrl: ClickCustomUrl },
          },
        };
        const find = { WalletAddress: MyItemAddr ,  CustomUrl: MyItemCustomUrl }
        const Findup = await FindUserandUpdate(find , update);

        if (Findup) {
          const update_following = {
            $push: {
              Following: { Address: MyItemAddr, CustomUrl: MyItemCustomUrl },
            },
          };
          const find = {  WalletAddress: ClickAddr ,  CustomUrl: ClickCustomUrl }

          const Find_following = await FindUserandUpdate(find , update_following)
          if (Find_following) {
           return  sendResponse(res , 200 , true , "follow")
          }
        }
      }
    }
  }catch(error){
    catchresponse(res , error);
  }
};

/**
 *
 * @param { email : "example@gmail.com"  } req
 * @param { this function is used to add email in newsletter collection in DB   } res
 * @usage   Newsletter
 * @TYPE : POST
 */

export const Newsletter = async (req, res) => {
  try {
    const {email} = req.body
    const data = { email: email }
    const Exists = await FindNewsletter(data)
    
    if (Exists) {
     return sendResponse(res, 409 , false ,"Email Id already exist")  
    } 
    await SaveNewsletter({ email: email })
    sendResponse(res , 201 , true , "subscribed" )
  } catch (error) {
    catchresponse(res , error);
  }
};

/**
 *
 * @param { address , skip  } req
 * @param { this function is used to get  notication based on the recent activity  in DB   } res
 * @usage   Newsletter
 * @TYPE : POST
 */

export const notification = async(req , res ) =>{
  const {address , skip } = req?.query 
try{
   let notificationdata = await FindNotification(address , skip)
        if(notificationdata){
            sendResponse(res , 200, true , "fetched" , notificationdata  )
        }else{
            sendResponse(res , 200, true , "fetchednull" , []  )
        }
    }catch(error){
    catchresponse(res , error);
    }

}

export const getbalance = async(req , res )=>{
  try {
    const { address } = req?.query
    const balance = await getBalance(address)

    console.log("balancebalance",balance)
    res.status(200).json({ status : true  , message : "Success" , balance: balance})
  } catch (error) {
    catchresponse(res , error);
    
  }
}


export const updatebalance = async(req , res )=>{
  try {
    const { address } = req?.query
    const balance = await getBalance(address)

    console.log("balancebalance",balance)
    // sendRes()
    res.status(200).json({ status : true  , message : "Success" , balance: balance})
  } catch (error) {
    catchresponse(res , error);
    
  }

}
export const addbalance = async(req , res )=>{
  try {
    const { walletAddress ,  stacked , currencyId , balance} = req?.body
const data = await Finduser({WalletAddress : walletAddress})
    const payload ={
      walletAddress : walletAddress,
      userId : data?._id , 
      currencyId : currencyId ,
      stacked : stacked,
      balance : balance
    } 

    // this service is from admin cms module (sry because of too much work)
 const curexis = await checkcurencyexist_service(currencyId)
 if(!curexis){
  return res.status(404).json({ status : false  , message : "no currency available" })
  
 }
const cr = await addbalace(payload)
  sendRes(res , 200 , true , "Success" , cr)
    
  } catch (error) {
    catchresponse(res , error);
    
  }
}

// ! remove deletewithdisplay when you see this 
// ! this is developed only for developing purpose
export const deletewithdisplay = async(req , res )=>{
  const { name } = req?.body
  const userdb = require('./schema/user.schema')
  const data = await userdb.deleteOne({DisplayName : name})
  res.status(200).json({ status : true  , message : "deleted" , data  : data})
}


export const createCurrencyforuser = async(walletAddress , _id )=>{
try{
  // this service from admin cms
  const data = await get_cuurencyList_Service()
  const newcurrency = []
for (let i = 0 ; i < data.length ; i++){
  


const bal = await Token_Balance_Calculation(data[i].address , walletAddress )

  let payload =  {
    userId : _id,
    walletAddress : walletAddress.toLowerCase(),
    currencyId : data[i]._id,
    label : data[i].label,
    balance : bal,
  }

  newcurrency.push(payload)
}

const records = await creteMultipleusercurrency(newcurrency)

// console.log("sdjasodhaisdas" , records , bal)

// sendRes(res,200 , true , "Success" , records)

}catch(error){
  console.error(error)
    // catchresponse(res , error);

}


}

