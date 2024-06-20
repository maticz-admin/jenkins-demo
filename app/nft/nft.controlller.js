import { FindToken, FindTokenownerandUpdate , FindTokenandUpdate, TokenList, exploreservice, explorecollectionservice, TokenInfo, Exploreservice, Activity, FindCollection, FindCollectionandUpdate, FindTokenOwners, FindOneBid, FindOneBidandUpdata, exploreauctionService, ActivityList, CollectionList, HomeCollectionFunc, CollectionListHome, BidInfo, MyItemList, Created, SaveBid, CreateCollectionFunc, exploretokenservice, forcollection, SaveCollection, collectionfind, collectionget, collectionstatus, SaveTokenOwners} from "./nft.services";
import { catchresponse, isEmpty, saveIpfsData, sendResponse } from "../../shared/commonFunction";
import { ipfs_add, glbipfs_add , ImageAddFunc } from "../../shared/commonFunction";
import { Finduser, userseachservice } from "../user/user.services";
import { Aggregate } from "../../shared/mongoosehelper";
import fs from "fs";
import config from '../../config/config'
import Web3 from "web3";
const TokenOwnersDb = require('./schema/tokenowner.schema')
const TokenDb= require('./schema/token.schema')
const StakeDb = require('./schema/stake.schema')

// const TokenDb = require('./schema/token.schema')
// const TokenownerDb = require('./schema/tokenowner.schema')
const util = require("util");
let movefile = util.promisify(fs.writeFile);
let MkDir = util.promisify(fs.mkdir);
/**
 * Validates the NFT name provided in the request body.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Promise} Promise representing the validation result
 */
export const validateNFTName = async (req, res) => {
    const { NFTName } = req.body;

    if (!NFTName) {
        return sendResponse(res, 400, false, "NFTName is required");
    }

    try {
        const existingNFT = await FindToken({ NFTName });

        if (existingNFT) {
            return sendResponse(res, 400, false, "NFTName already exists");
        }

        return sendResponse(res, 200, true, "NFTName is available");
    } catch (error) {
        catchresponse(res, error);
    }
};
  
/**
 * Async function for uploading NFT image.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Object} the response object
 */

export const nftImageUpload = async (req, res) => {

  try {
    const { NFTCreator, NFTName, NFTDescription, type, NFTProperties, extention, glbipfs } = req.body;
    const ref = Date.now();
    const JSOnpat = "public/nft/" + NFTCreator + "/jsonfolder";
    const cleanNftName = NFTName.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s/g, "");
    const MetFile = cleanNftName + ".txt";
    

    if (extention == 'glb' && glbipfs) {
      let glbfileipfs = glbipfs
      glbfileipfs = glbfileipfs.split("/")[glbfileipfs.split("/").length - 2] + "/" + glbfileipfs.split("/")[glbfileipfs.split("/").length - 1]

      const NFTThumpImage = await ImageAddFunc([
        {
          path: `public/nft/${NFTCreator}/Original/NFT_THUMB/`,
          files: req.files.NFTThumpImage,
          filename:
            ref +
            "." +
            req.files.NFTThumpImage.name.split(".")[
            req.files.NFTThumpImage.name.split(".").length - 1
            ],
        },
      ]);

      const CompressedThumbFile = await compress_file_upload([
        {
          path: `public/nft/${NFTCreator}/Compressed/NFT_THUMB/`,
          files: req.files.NFTThumpImage,
          filename: ref + ".webp",
        },
      ]);

      const NFTThumpImageIpfs = await ipfs_add({
        item: "img",
        path: `public/nft/${NFTCreator}/Original/NFT_THUMB/${NFTThumpImage}`,
      });
      let data = req?.files?.NFTOrginalImage
      const NFTOrginalImageIpfs = glbfileipfs
      if ( NFTOrginalImageIpfs && NFTThumpImageIpfs ) {

        let newmetadata = {
          name: NFTName,
          image: config.IPFS_IMG + NFTThumpImageIpfs,
          description: NFTDescription,
        };

        if (NFTThumpImage) {
          newmetadata.animation_url = config.IPFS_IMG + NFTOrginalImageIpfs;
        }
        if (NFTProperties.length > 0) {
          const arrayproperty = JSON.parse(NFTProperties);
          let properties = [];
          arrayproperty.map((val) => {
            properties.push({ "trait_type": Object.keys(val)[0], "value": Object.values(val)[0] });
          });
          newmetadata.attributes = properties;
        }
        fs.mkdir(JSOnpat, { recursive: true }, function (err, data) {
          if (err) return false;
          const senddata = JSON.stringify(newmetadata);
          fs.writeFile(
            `${JSOnpat}/${MetFile}`,
            `${senddata}`,
            async function (err, data) {
              if (err) return err;

              const MetaData = await ipfs_add({
                item: "img",
                path: `${JSOnpat}/${MetFile}`,
              });


              if (MetaData) {
             return    sendResponse(res, 200, true, "Uploaded Successfully" , {    NFTOrginalImage: glbfileipfs,
                    NFTThumpImage: NFTThumpImage,
                    CompressedFile: glbfileipfs,
                    CompressedThumbFile: CompressedThumbFile,
                    NFTOrginalImageIpfs: glbfileipfs,
                    NFTThumpImageIpfs: NFTThumpImageIpfs,
                    MetaData: MetaData,
                    MetFile: MetFile,});
            
              } else {
                return sendResponse(res, 400, false, "Uploaded Failed" , {});
             
              }
            }
          );
        });
      }

    } else {
      const response = type == "list" ? await axios.get(req?.body?.NFTOrginalImage, { responseType: 'arraybuffer' }) : undefined
      const OrginalFile = type == "list" ? Buffer.from(response.data, "utf-8") : req?.files?.NFTOrginalImage
      const ImgTYpeName = type == "list" ? (response.headers["content-type"].includes('image') ? `${ref}.webp` : response.headers["content-type"].includes('video') ? `${ref}.webm` : `${ref}.mp3`) : ref + "." +

        req?.files?.NFTOrginalImage.name.split(".")[
        req?.files?.NFTOrginalImage.name.split(".").length - 1
        ]
      if (type == "list") {
        await MkDir(`public/nft/${NFTCreator}/Original/NFT/`, { recursive: true })
      }
      if (OrginalFile) {
        const NFTOrginalImage = type == "list"
          ? await movefile(`public/nft/${NFTCreator}/Original/NFT/${ImgTYpeName}`, OrginalFile)
          : await ImageAddFunc([
            {
              path: `public/nft/${NFTCreator}/Original/NFT/`,
              files: req.files?.NFTOrginalImage,
              filename: ImgTYpeName,
            },
          ]);

          const CompressedFile = await compress_file_upload([
          {
            path: `public/nft/${NFTCreator}/Compressed/NFT/`,
            files: type == "list" ? {
              data: Buffer.from(response.data, "utf-8"), name: ref, mimetype: response.headers["content-type"]
            } : req.files.NFTOrginalImage,
            filename:
              type == "list" ? (response.headers["content-type"].includes('image') ? `${ref}.webp` : response.headers["content-type"].includes('video') ? `${ref}.webm` : `${ref}.mp3`)
                :
                ref +
                (req.files.NFTOrginalImage.mimetype.includes("image")
                  ? ".webp"
                  : req.files.NFTOrginalImage.mimetype.includes("video")
                    ? ".webm"
                    : ".mp3"),
            fie_path:
              `public/nft/${NFTCreator}/Original/NFT/` +
              ImgTYpeName
          },
        ]);
        var NFTOrginalImageIpfs = type == "list" ? undefined : await ipfs_add({
          item: "img",
          path: `public/nft/${NFTCreator}/Original/NFT/${NFTOrginalImage}`,
        });

        if (req?.files?.NFTThumpImage) {
          var NFTThumpImage =
            await ImageAddFunc([
              {
                path: `public/nft/${NFTCreator}/Original/NFT_THUMB/`,
                files: req.files.NFTThumpImage,
                filename:
                  ref +
                  "." +
                  req.files.NFTThumpImage.name.split(".")[
                  req.files.NFTThumpImage.name.split(".").length - 1
                  ],
              },
            ]);
          var CompressedThumbFile = await compress_file_upload([
            {
              path: `public/nft/${NFTCreator}/Compressed/NFT_THUMB/`,
              files: req.files.NFTThumpImage,
              filename: ref + ".webp",
            },
          ]);
          var NFTThumpImageIpfs = await ipfs_add({
            item: "img",
            path: `public/nft/${NFTCreator}/Original/NFT_THUMB/${NFTThumpImage}`,
          });
        } else {
          var NFTThumpImage = "",
            NFTThumpImageIpfs = "",
            CompressedThumbFile = "";
        }


        if (type == "list") {
          fs.mkdir(JSOnpat, { recursive: true }, function (err, data) {
            if (err) return false;
            fs.writeFile(
              `${JSOnpat}/${MetFile}`,
              `${req.body.MetFile}`,
              async function (err, data) {
                if (err) return err;
                return sendResponse(res, 200, "success", "Uploaded Successfully", {
                    NFTOrginalImage: ImgTYpeName,
                    CompressedFile: CompressedFile,
                    MetFile: MetFile,
                })
              }
            );
          });
        }else {
          if (
            NFTOrginalImage &&
            NFTOrginalImageIpfs &&
            (NFTOrginalImage || NFTThumpImage) &&
            (NFTOrginalImageIpfs || NFTThumpImageIpfs)
          ) {
            let newmetadata = {
              name: NFTName,
              image: req.files.NFTOrginalImage.mimetype.includes("image")
                ? config.IPFS_IMG + NFTOrginalImageIpfs
                : config.IPFS_IMG + NFTThumpImageIpfs,
              description: NFTDescription,
            };
            if (NFTThumpImage) {
              newmetadata.animation_url = config.IPFS_IMG + NFTOrginalImageIpfs;
            }
            if (NFTProperties.length > 0) {
              const arrayproperty = JSON.parse(NFTProperties);
              let properties = [];
              arrayproperty.map((val) => {
                properties.push({ "trait_type": Object.keys(val)[0], "value": Object.values(val)[0] });
              });
              newmetadata.attributes = properties;
            }
            fs.mkdir(JSOnpat, { recursive: true }, function (err, data) {
              if (err) return false;
              const senddata = JSON.stringify(newmetadata);
              fs.writeFile(
                `${JSOnpat}/${MetFile}`,
                `${senddata}`,
                async function (err, data) {
                  if (err) return err;
                  const MetaData = await ipfs_add({
                    item: "img",
                    path: `${JSOnpat}/${MetFile}`,
                  });
                  if (MetaData) {
                    return sendResponse(res, 200, "success", "Uploaded Successfully", {
                        NFTOrginalImage: NFTOrginalImage,
                        NFTThumpImage: NFTThumpImage,
                        CompressedFile: CompressedFile,
                        CompressedThumbFile: CompressedThumbFile,
                        NFTOrginalImageIpfs: NFTOrginalImageIpfs,
                        NFTThumpImageIpfs: NFTThumpImageIpfs,
                        MetaData: MetaData,
                        MetFile: MetFile,   
                    })
        
                  } else
                  return sendResponse(res, 400 , false , "Uploaded Failed" , {})
               
                }
              );


            });



          }
        }
      }
      else{
     return sendResponse(res, 400 , false , "Nothing To Update" , {})
      
      
    }
    }
  } catch (e) {

    return catchresponse(res , e)

  }
};


export const createNewNFT = async (req, res) => {
    try {
      const {
        click,
        CollectionNetwork,
        CollectionName,
        NFTId,
        NFTName,
        Category,
        NFTDescription,
        NFTOrginalImage,
        NFTThumpImage,
        UnlockContent,
        CollectionSymbol,
        ContractAddress,
        ContractType,
        NFTRoyalty,
        NFTProperties,
        CompressedFile,
        CompressedThumbFile,
        NFTOrginalImageIpfs,
        NFTThumpImageIpfs,
        MetaData,
        MetFile,
        NFTCreator,
        NFTQuantity,
        PutOnSale,
        PutOnSaleType,
        NFTPrice,
        CoinName,
        ClockTime,
        EndClockTime,
        HashValue,
        NFTOwner,
        activity,
        NFTBalance,
        EmailId,
        LazyStatus,
        NonceHash,
        RandomName,
        SignatureHash
      } = req?.body;
  
      const TokenADd = await TokenOwnerADD(
        {
          CollectionNetwork,
          CollectionName,
          MetFile,
          CollectionSymbol,
          NFTId,
          NFTName,
          Category,
          NFTDescription,
          NFTOrginalImage,
          NFTThumpImage,
          UnlockContent,
          ContractAddress,
          ContractType,
          NFTRoyalty,
          NFTProperties,
          CompressedFile,
          CompressedThumbFile,
          NFTOrginalImageIpfs,
          NFTThumpImageIpfs,
          MetaData,
          NFTCreator,
          NFTQuantity,
          activity,
          LazyStatus,
          NonceHash,
          RandomName,
          SignatureHash
        },
        {
          PutOnSale,
          PutOnSaleType,
          NFTPrice,
          CoinName,
          ClockTime,
          EndClockTime,
          HashValue,
          NFTOwner,
          NFTBalance,
          LazyStatus,
          NonceHash,
          RandomName,
          SignatureHash
        }
      );
      // emailservice
      // if (activity == "Mint" && TokenADd.success == "success") var Send_Mail = await Node_Mailer({ Type: 'mint', EmailId: EmailId, Subject: `Minting An ${(CollectionNetwork == 'Polygon') ? "Polygon" : 'MATIC'}${(ContractType == 721 || ContractType == "721") ? '721' : '1155'}`, OTP: '', click: click })
      // if(activity == "TransfersFiat" && TokenADd.success == "success") var Send_Mail   =   await Node_Mailer({Type:'transfer_drop',EmailId:EmailId,Subject:'Tranfer Drop',OTP:'',click:click})
      // if (activity == "PutOnSale" && TokenADd.success == "success") var Send_Mail = await Node_Mailer({ Type: 'putonsale', EmailId: EmailId, Subject: 'Listing An NFT', OTP: '', click: click })
      // if (activity == "CancelOrder" && TokenADd.success == "success") var Send_Mail = await Node_Mailer({ Type: 'cancelorder', EmailId: EmailId, Subject: 'Cancel Price An NFT', OTP: '', click: click })
      // if(activity == "Lower" && TokenADd.success == "success") var Send_Mail   =   await Node_Mailer({Type:'lower',EmailId:EmailId,Subject:'Changing Price An NFT',OTP:'',click:click})
      await Activity({
        From:
          (activity === "Mint" || activity === "List")
            ? "NullAddress"
            : activity === "TransfersFiat"
              ? NFTCreator
              : NFTOwner,
        To: (activity === "Mint") ? NFTCreator : NFTOwner,
        Activity: activity,
        NFTPrice: NFTPrice,
        Type: PutOnSale ? PutOnSaleType : "Not For Sale",
        CoinName: CoinName,
        NFTQuantity: NFTQuantity,
        HashValue: HashValue,
        NFTId: NFTId,
        ContractType: ContractType,
        ContractAddress: ContractAddress,
        CollectionNetwork: CollectionNetwork,
        Category: Category,
        CollectionSymbol: CollectionSymbol,
        CollectionName: CollectionName
  
      });
      return sendResponse(res,200,true,TokenADd);
    } catch (e) {
        catchresponse(res,e)
    }
  };


  export const TokenOwnerADD = async (data, tokenOWN) => {
    tokenOWN.NFTBalance = tokenOWN.NFTBalance
      ? tokenOWN.NFTBalance
      : tokenOWN.NFTQuantity
        ? tokenOWN.NFTQuantity
        : data.NFTQuantity;
  
    tokenOWN.NFTId = data.NFTId;
    tokenOWN.NFTOwner = tokenOWN.NFTOwner ? tokenOWN.NFTOwner : data.NFTCreator;
    tokenOWN.Status = "list";
    tokenOWN.tokenowner = data.NFTCreator;
    let add =""

    let finddata = {
        NFTId: data.NFTId,
        NFTOwner: tokenOWN.NFTOwner ? tokenOWN.NFTOwner : data.NFTCreator,
      }
    let selectdata = { _id: 0, NFTRoyalty: 1, NFTBalance: 1 }


    let data_already_token_list = await FindTokenOwners(finddata ,selectdata )

    tokenOWN.NFTBalance =
      data.activity === "TransfersFiat"
        ? data_already_token_list?.NFTBalance
          ? Number(data_already_token_list?.NFTBalance) +
          Number(tokenOWN.NFTBalance)
          : tokenOWN.NFTBalance
        : tokenOWN.NFTBalance;

    let findata = {
        NFTId: data.NFTId,
        NFTOwner: tokenOWN.NFTOwner ? tokenOWN.NFTOwner : data.NFTCreator,
      }
      let update = { $set: tokenOWN }
    const Finddata = await FindTokenownerandUpdate(findata , update , { new: true });
    if (Finddata) {
      if (isEmpty(Finddata.NFTBalance)) {

        add = await TokenADD(data, Finddata._id);
      }
      return Finddata;
    } else {
      tokenOWN.NFTQuantity = tokenOWN.NFTQuantity
        ? tokenOWN.NFTQuantity
        : data.NFTQuantity;
      tokenOWN.NFTBalance = tokenOWN.NFTBalance
        ? tokenOWN.NFTBalance
        : tokenOWN.NFTQuantity
          ? tokenOWN.NFTQuantity
          : data.NFTQuantity;
   
      let Resp = await  SaveTokenOwners(tokenOWN)
      if (Resp) {
        add = await TokenADD(data, Resp._id);
        return add;
      } else {
        return Resp;
      }
    }
  };


  export const TokenADD = async (data, _id) => {
    data.NFTOwnerDetails = [_id];
    const newdata = {
      data,
    };
   const FinData =   { NFTBalance: '0' , _id }
    const List_chk = await FindTokenOwners(FinData)
    const update = List_chk
    ? { $pull: { NFTOwnerDetails: _id } }
    : { $push: { NFTOwnerDetails: _id } };
    const findata = { NFTId: data.NFTId, NFTCreator: data.NFTCreator }
    const Find =  FindTokenandUpdate(findata , update)
    if (Find) {
      return Find;
    } else {
        return  await FindToken(newdata.data);
    }
  };


  export const CreateCollection = async (req, res) => {
try {
    const {
      CollectionName,
      CollectionSymbol,
      CollectionBio,
      Category,
      CollectionType,
      CollectionNetwork,
      CollectionCreator,
      CollectionContractAddress
  
    } = req?.body;
    let SenVal = {}
    const ref = Date.now();
    let FinData =  { CollectionSymbol }
    let SelData = { CollectionSymbol: 1 }
    let data_already_token_list = await  FindCollection(FinData ,SelData )
    if (data_already_token_list){
        return sendResponse(res , 409 , false , "symbol already exits",null)
    }else {
      if (!req?.files) {
         SenVal = {
            CollectionName,
            CollectionSymbol,
            CollectionBio,
            CollectionType,
            CollectionNetwork,
            CollectionCreator,
            CollectionContractAddress: CollectionContractAddress.toLowerCase(),
            Category,
          }
      }
      else {
        const { CollectionProfileImage, CollectionCoverImage } = req?.files;
        const profile = CollectionProfileImage
          ? await ImageAddFunc([
            {
              path: `public/collection/profile/${CollectionSymbol}/`,
              files: CollectionProfileImage,
              filename: ref + "." + "webp",
            },
          ])
          : "";
          const cover = CollectionCoverImage
          ? await ImageAddFunc([
            {
              path: `public/collection/cover/${CollectionSymbol}/`,
              files: CollectionCoverImage,
              filename: ref + "." + "webp",
            },
          ])
          : "";
         SenVal =  {
            CollectionName,
            CollectionSymbol,
            CollectionBio,
            CollectionType,
            CollectionNetwork,
            CollectionCreator,
            CollectionProfileImage: profile,
            CollectionCoverImage: cover,
            CollectionContractAddress,
            Category,
          }
        // let Resp = await MongooseHelper.Save(SenVal);
        const Resp = await SaveCollection(SenVal)

      return sendResponse(res , 201 , true , "Collection Created Successfully",Resp)

      }
    }
} catch (error) {
     catchresponse(res,error)
}
  };




  export const SearchAction = async (req, res) => {
    const {  limit, page, from } = req.query
    const { Classid, keyword } = req.query;

    let SendDta = {}
    SendDta.limit = (parseInt(limit) ?? 1) * page
    SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit
    SendDta.from = from
    SendDta.sort = { 'updatedAt': -1 }
  
    SendDta.CustomUrl = '';
  
  
    SendDta.tokenOwnerMatch = {
      $expr: {
        '$and': [
          { '$ne': ['$NFTBalance', '0'] },
          { '$eq': ['$Status', 'list'] },
          { '$eq': ['$HideShow', 'visible'] },
          { '$eq': ['$NFTId', '$$tId'] },
        ]
      }
    }
 

 
    SendDta.TokenMatch = {
  
      NFTName: { "$regex": req.query.keyword, "$options": "ix" },

      // NFTProperties:  { $elemMatch: {
      //   $or: [
      //     {
      //       "skin" : "white"
      //   }, 
      //   {
      //       "body" : "fat"
      //   }
      //   ] ,

    

      // }},
      reported: false
    }
    // SendDta.user = {
  
    //   DisplayName: { "$regex": req.query.keyword, "$options": "ix" }
  
    // }
  
    // SendDta.Collection = {
  
    //   CollectionName: { "$regex": req.query.keyword, "$options": "ix" },
  
    // }
    // SendDta.Tokens = Tokens
  
    let Retdata = {}
    Retdata.token = await TokenList(SendDta);
    // Retdata.user = await UserSearch(SendDta);
    // Retdata.collection = await collectionsearch(SendDta);
    // Retdata.from = from;
   

    return res.status(200 ).json({
      status : true ,
      message :  "Success",
      data : Retdata
    }) 
    // sendResponse(res, 200, true, "Search Action Success", Retdata)
  
  }
  
  
  const UserSearch = async (data) => {
    let userdata = {
     findata: data.user, selectdata: {}, limit: data.limit, skip: data.skip, sort: data.sort
    }
    let List = await userseachservice(userdata)
    return List?.data
  }
  

  
  const collectionsearch = async (data) => {
 
    let List = await  collectionAggregate(data)

    return List
  }
  


  export const Tokenlistfunc = async (req, res) => {
    const { TabName, limit, CustomUrl, page, from, CollectionSymbol } = req.query;
    let SendDta = {};
    SendDta.limit = parseInt(limit) ?? 1;
    SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
    SendDta.CustomUrl = CustomUrl;
    SendDta.from = from;

    if (from == "Explore") {
      const { filter } = req.query
      SendDta.tokenOwnerMatch = {
        $expr: {
          $and: [
            { $ne: ["$NFTBalance", "0"] },
            // { '$eq':['$Status', 'list' ]},
            { $eq: ["$HideShow", "visible"] },
            { $eq: ["$NFTId", "$$tId"] },
          ],
        },
      };
      var TabNames =
        TabName == "All" ||
          TabName == "LatestDrops" ||
          TabName == "PriceLowToHigh" ||
          TabName == "PriceHighToLow"
          ? ""
          : TabName;
      SendDta.TokenMatch = {
        Category: TabNames ? TabNames : { $ne: "" },
        reported: { $eq: false },
      };
      SendDta.sort = { "tokenowners_list.updatedAt": -1 };
      if (filter == "PriceLowToHigh") {
        SendDta.TokenMatch = {
          Category: TabNames ? TabNames : { $ne: "" },
          reported: { $eq: false }
        };
        SendDta.sort = { "NFTPrice": 1 };
      } else if (filter == "PriceHighToLow") {
        SendDta.TokenMatch = {
          Category: TabNames ? TabNames : { $ne: "" },
          reported: { $eq: false }
        };
        SendDta.sort = { "NFTPrice": -1 };
      } else if (filter == "oldest") {
        SendDta.sort = { "tokenowners_list.updatedAt": 1 };
        SendDta.TokenMatch = { Category: TabNames ? TabNames : { $ne: "" }, };
      }
      // this is for show the recently putonsale 

    //   else if (filter == "recentlisted") {
    //     SendDta.tokenOwnerMatch = {
    //       $expr: {
    //         $and: [
    //           { $ne: ["$NFTBalance", "0"] },
    //           // { '$eq':['$Status', 'list' ]},
    //           { $eq: ["$HideShow", "visible"] },
    //           { $eq: ["$NFTId", "$$tId"] },
    //         ],
    //       },
    //     };
    //     SendDta.Activitymatch = {
    //       Category: TabNames ? TabNames : { $ne: "" },
    //       Type: { $ne: "Not For Sale" }
    //     }
    //   }
      else if (filter == "recentcreated") {
        SendDta.tokenOwnerMatch = {
          $expr: {
            $and: [
              { $ne: ["$NFTBalance", "0"] },
              // { '$eq':['$Status', 'list' ]},
              { $eq: ["$HideShow", "visible"] },
              { $eq: ["$NFTId", "$$tId"] },
            ],
          },
        };
        SendDta.Activitymatch = {
          Category: TabNames ? TabNames : { $ne: "" },
          Activity: "Mint"
        };
      } else if (filter == "recentsold") {
        SendDta.tokenOwnerMatch = {
          $expr: {
            $and: [
              { $ne: ["$NFTBalance", "0"] },
              // { '$eq':['$Status', 'list' ]},
              { $eq: ["$HideShow", "visible"] },
              { $eq: ["$NFTId", "$$tId"] },
            ],
          },
        };
        SendDta.Activitymatch = {
          Category: TabNames ? TabNames : { $ne: "" },
          Activity: "Buy"
        };
      }
      SendDta.filter = filter
    }
 
  if (from == "Sale") {
      const { filter } = req.query
      SendDta.tokenOwnerMatch = {
        $expr: {
          $and: [
            { $eq: ["$HideShow", "visible"] },
            //    { '$eq':['$Status', 'list' ]},
  
            { $eq: ["$NFTId", "$$tId"] },
            { $ne: ["$NFTBalance", "0"] },
          ],
        },
      };
      var TabNames =
        TabName == "All" ||
          TabName == "LatestDrops" ||
          TabName == "PriceLowToHigh" ||
          TabName == "PriceHighToLow"
          ? ""
          : TabName;
      SendDta.TokenMatch = {
        Category: TabNames ? TabNames : { $ne: "" },
        reported: { $eq: false },
      };
      // SendDta.sort = { "tokenowners_list.updatedAt": -1 };
      if (filter == "BLTH") {
        SendDta.sort = { "NFTPrice": 1 };
        // SendDta.TokenMatch = {};
      } else if (filter == "BHTL") {
        SendDta.sort = { "NFTPrice": -1 };
        // SendDta.TokenMatch = {};
      } else if (filter == "OLD") {
        SendDta.sort = { "tokenowners_list.updatedAt": 1 };
        // SendDta.TokenMatch = {};
      } else if (filter == "LatestDrops") {
        SendDta.sort = { "tokenowners_list.updatedAt": -1 };
      }
    }

     if (from == "collection") {
      SendDta.tokenOwnerMatch = {
        $expr: {
          $and: [
            { $ne: ["$NFTBalance", "0"] },
            // { '$eq':['$Status', 'list' ]},
            { $eq: ["$HideShow", "visible"] },
            { $eq: ["$NFTId", "$$tId"] },
          ],
        },
      };
      if (TabName == "LTH") {
        SendDta.TokenMatch = {
          reported: { $eq: false },
          CollectionSymbol: { $eq: CollectionSymbol },
        };
        SendDta.sort = { "NFTPrice": 1 };
      } else if (TabName == "HTL") {
        SendDta.TokenMatch = {
          reported: { $eq: false },
          CollectionSymbol: { $eq: CollectionSymbol },
        };
        SendDta.sort = { "NFTPrice": -1 };
      } else if (TabName == "OLD") {
        SendDta.TokenMatch = {
          reported: { $eq: false },
          CollectionSymbol: { $eq: CollectionSymbol },
        };
        SendDta.sort = { "tokenowners_list.upadatedAt": 1 };
      } else if (TabName == "NOW") {
        SendDta.TokenMatch = {
          reported: { $eq: false },
          CollectionSymbol: { $eq: CollectionSymbol },
        }; SendDta.sort = { "tokenowners_list.upadatedAt": -1 };
      } else if (TabName == 'new') {
        SendDta.TokenMatch = {
          reported: { $eq: false },
          CollectionSymbol: { $eq: CollectionSymbol },
        }
      }
      else {
        var TabNames =
          TabName == "All" ||
            TabName == "LatestDrops" ||
            TabName == "PriceLowToHigh" ||
            TabName == "PriceHighToLow"
            ? ""
            : TabName;
        SendDta.TokenMatch = {
          Category: TabNames ? TabNames : { $ne: "" },
          reported: { $eq: false },
          CollectionSymbol: { $eq: CollectionSymbol },
        };
        SendDta.sort = { "tokenowners_list.updatedAt": -1 };
      }
    } 
 
    SendDta.Tokens = Tokens;
  
    SendDta.TabName = TabName;
    let RetData;
    if (SendDta.Activitymatch) {
      RetData = await MongooseHelper.ExplorewithActivity(SendDta)
    }
    else {
      RetData = await MongooseHelper.TokenList(SendDta);
    }
  
    
sendResponse(res, 200, true, "fetched" , RetData)
  
  };

  export const Explore = async(req ,res)=>{
    try{
      console.log("sdahsdga" , req.query)
        const { TabName, limit, CustomUrl, page, from , filter , pricerange } = req.query;
        // const { TabName, limit, CustomUrl, page, from , filter , pricerange } = req.query.data;
        // console.log(  pricerange)
        const result = await exploreservice( TabName, limit, CustomUrl, page, from , filter  )
        sendResponse(res, 200, result ? true : false , "fetched" , result ? result : [])
    }catch(error){
        catchresponse(res , error);
    }

   
  } 

  //  (from == "Auction") 
export const exploreauction = async(req ,res)=>{
  try {
    // const { TabName, limit, CustomUrl, page, from , filter} = req.query;
    const result = await exploreauctionService(req.query)
    sendResponse(res, 200, result ? true : false , "fetched" , result)

    
  } catch (error) {
    catchresponse(res,error)
  }
}

  export const ExploreCollection = async(req ,res)=>{
    try{
    const { TabName, limit, CustomUrl, page, from , filter} = req.query;
    const result = await explorecollectionservice(TabName, limit, CustomUrl, page, from , filter)
    sendResponse(res, 200, result ? true : false , "fetched" , result)
    }catch(error){
    catchresponse(res , error);
    }
  }


  export const Findupdatebalance = async (req, res) => {

    try {
  
  
      let ReqBody = req?.body;
      let NFTId = String(ReqBody?.NFTId); //changed
      let NFTBalance = Number(ReqBody?.NFTBalance);
      let NFTOwner = ReqBody?.NFTOwner.toLowerCase();
      let Currentowner = ReqBody?.Currentowner.toLowerCase();
      let Type = ReqBody?.type;
  
  
      if (Type == '721') {
  
        let FinData = { WalletAddress: Currentowner };
  
        

        // service from user model
        const findalreadyexist = await  Finduser(FinData , {})
        if (!findalreadyexist) {
          let saveData = {}
          saveData._id = Currentowner;
          saveData.CustomUrl = Currentowner;
          saveData.WalletAddress = Currentowner
          const savedata = await  SaveUser(saveData)
       
        }
     
        let checkExistingbalance = await FindTokenownerandUpdate({ NFTOwner: NFTOwner, NFTId: NFTId, NFTBalance: '1' } , { NFTBalance: '0' })
  
        // ! checking we already have this account for prevent duplication if we not find 
  
   
  
        let findx = await   FindTokenOwners( {
            "NFTId": NFTId, "NFTOwner": Currentowner, "NFTQuantity": "1",
            "NFTBalance": "1"
          } , {})
  
  
  
        let savedata
  
        if (!findx && checkExistingbalance?.data?.HashValue) {
          let newdata = {
            "NFTId": NFTId,
            "NFTOwner": Currentowner,
            "HashValue": checkExistingbalance?.data?.HashValue,
            "PutOnSale": "false",
            "PutOnSaleType": "UnlimitedAuction",
            "NFTPrice": "",
            "CoinName": checkExistingbalance?.data?.CoinName,
            "Status": "list",
            "NFTQuantity": "1",
            "NFTBalance": "1",
            "ClockTime": null,
            "EndClockTime": null,
            "HideShow": "visible",
            "deleted": 0,
            "burnToken": 0,
            "Platform": "our",
            "bannerpromotion": false,
          }
          savedata = await SaveTokenOwners(newdata)
          // * update in token DB 
          let updatetokens = await FindTokenandUpdate({ NFTId: NFTId } , { NFTOwnerDetails: [savedata?.data?._id] })
        }
  

        return res.status(200).json({ success: true });
  
  
      }
  
  
  
      if (Type == '1155') {
        const checkExistingbalance = await FindTokenOwners({ NFTOwner: NFTOwner, NFTId: NFTId } ,{ _id: 0, NFTQuantity: 1, NFTBalance: 1 }  )
  
        if (checkExistingbalance) {
          if (Number(checkExistingbalance.NFTBalance) != Number(NFTBalance)) {
            let Updata = {}
            if (Number(checkExistingbalance.NFTBalance) < Number(NFTBalance)) {
              Updata = {
                NFTBalance: Number(NFTBalance)
              }
            }
            else {
              Updata = {
                NFTBalance: Number(NFTBalance)
              }
            }
            const updatedData = await   FindTokenownerandUpdate( { NFTOwner: NFTOwner, NFTId: NFTId } , Updata)
            return res.status(200).json(updatedData)
          }
        }
  
        return res
          .status(200)
          .json({ success: true });
  
      }
    } catch (error) {
      console.error("errorinbalancecheck", error)
    }
  
  
  }
  

  export const findOwners = async (req, res) => {
try{
 
    const List = await   FindToken({ NFTId: req?.query?.NFTId })

    if(List){
     return  sendResponse(res , 200 , true , "fetched successfully" , List)
    }

    return sendResponse(res , 404 , false , "data not found" , List)
}catch(error){
    catchresponse(res , error)
}
  }


  /**
   * A description of the entire function.
   *
   * @param {object} req - the request object
   * @param {object} res - the response object
   * @return {Promise<void>} no return value
   */

  export const info = async (req, res) => {
    try{

    
    const { Contract, Owner, Id, TabName, page, MyAdd, limit } = req.query;
    let SendDta = {},
      Bid = {},
      highBid = {},
      myBid = {};
    SendDta.NFTOwner = Owner;
    SendDta.NFTId = Id;
    SendDta.TokenMatch = {
      NFTId: Id,
      ContractAddress: Contract,
      reported: false,
    };
    SendDta.limit = parseInt(limit) ?? 1;
    SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
    SendDta.sort = { "tokenowners_list.updatedAt": 1 };
    SendDta.tokenOwnerMatch = {
      $expr: {
        $and: [
          { $ne: ["$NFTBalance", "0"] },
          { $eq: ["$HideShow", "visible"] },
          { $eq: ["$NFTId", "$$tId"] },
        ],
      },
    };
    SendDta.myowner = {
      $expr: {
        $and: [
          { $ne: ["$NFTBalance", "0"] },
          { $eq: ["$NFTOwner", MyAdd] },
          { $eq: ["$HideShow", "visible"] },
          { $eq: ["$NFTId", "$$tId"] },
        ],
      },
    };
    myBid.BidMatch = {
      $expr: {
        $and: [
          { $eq: ["$NFTId", Id] },
          { $eq: ["$TokenBidderAddress", MyAdd] },
          { $eq: ["$ContractAddress", Contract] },
          { $eq: ["$deleted", 1] },
          {
            $or: [
              { $eq: ["$status", "pending"] },
              { $eq: ["$status", "partiallyComplete"] },
            ],
          },
        ],
      },
    };
    myBid.sort = { updatedAt: -1 };
    highBid.BidMatch = {
      $expr: {
        $and: [
          { $eq: ["$NFTId", Id] },
          { $eq: ["$ContractAddress", Contract] },
          { $eq: ["$deleted", 1] },
          {
            $or: [
              { $eq: ["$status", "pending"] },
              { $eq: ["$status", "partiallyComplete"] },
            ],
          },
        ],
      },
    };
    highBid.sort = { TokenBidAmt: -1 };
  
    if (TabName != "owner") {
      SendDta.tokenOwnerMatch["$expr"]["$and"].push({
        $eq: ["$NFTOwner", Owner],
      });
    }
    if (TabName == "bid") {
      Bid.BidMatch = {
        $expr: {
          $and: [
            { $eq: ["$NFTId", Id] },
            { $eq: ["$ContractAddress", Contract] },
            { $eq: ["$deleted", 1] },
            {
              $or: [
                { $eq: ["$status", "pending"] },
                { $eq: ["$status", "partiallyComplete"] },
              ],
            },
          ],
        },
      };
      Bid.sort = { TokenBidAmt: -1 };
    }

    // SendDta.Tokens = Tokens; // schmea
    SendDta.TabName = TabName;
    let explore = {
      myaddress: MyAdd,
      match: {
        $expr: {
          $and: [
            { $ne: ["$NFTBalance", "0"] },
            { $eq: ["$NFTOwner", Owner] },
            { $eq: ["$HideShow", "visible"] },
          ],
        },
      },
    };
    var RetData = {};
    RetData.token = await TokenInfo(SendDta);
    RetData.Explore = await Exploreservice(explore);
  
    RetData.Bid =
      TabName == "bid" ? await BidInfo(Bid, SendDta) : [];
    RetData.myBid = await BidInfo(myBid, SendDta);
    RetData.highBid = await BidInfo(highBid, SendDta);
    RetData.UnlockContent = [];

    res.status(200).json({
      status: true,
      data: RetData,
    message: "fetched",})
    // sendResponse(res , 200 , true , "fetched" , RetData)
  }catch(error){
    catchresponse(res , error)
  }
  };





  export const MyItemTokenlistfunc = async (req, res) => {
    const {
      TabName,
      limit,
      CustomUrl,
      WalletAddress,
      NFTOwner,
      page,
      from,
      cursor,
      filter,
      collectionfrom,
      CollectionSymbol,
      Categoryname,
      Type,
      status  
    } = req.body;
   
    let SendDta = {};
    SendDta.limit = parseInt(limit) ?? 1;
    SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
    SendDta.CustomUrl = CustomUrl;
    SendDta.from = from;
    let Follow = {};
   
      let Categorymatch = Categoryname == "All" ? { $ne: ["$Category", ""] } : { $eq: ["$Category", Categoryname] };
      let Statusmatch = status == "All" ? { $ne: ["$PutOnSaleType", ""] } : { $eq: ["$PutOnSaleType", status] }
  
      if (TabName == "owned" || TabName == "onsale" || TabName == "created") {
  
        if (filter == "LatestDrops") {
          SendDta.sort = { updatedAt: -1 };
        }
        else if (filter == "OLD") {
          SendDta.sort = { updatedAt: 1 };
        }
        else if (filter == "BHTL") {
          SendDta.sort = { NFTPrice: -1 };
        }
        else if (filter == "BLTH") {
          SendDta.sort = { NFTPrice: 1 };
        }

        if (TabName == "owned") {
          SendDta.fromMatch = {
            $expr: {
              $and: [
                { $ne: ["$NFTBalance", "0"] },
                { $eq: ["$HideShow", "visible"] },
                { $eq: ["$NFTOwner", NFTOwner] },
                Statusmatch
              ],
            },
          };
          SendDta.refMatch = {
            $expr: {
              $and: [{ $eq: ["$NFTId", "$$tId"] }, { $eq: ["$reported", false] }, Categorymatch],
            },
          };
        
          SendDta.refTable = "tokens";
          // SendDta.fromTable = TokenOwners;
        }

        if (TabName === "onsale") {
          SendDta.fromMatch = {
            $expr: {
              $and: [
                { $ne: ["$NFTBalance", "0"] },
                // { '$eq':['$Status', 'list' ]},
                { $eq: ["$HideShow", "visible"] },
                { $eq: ["$PutOnSale", "true"] },
                { $eq: ["$PutOnSaleType", "FixedPrice"] },
                { $eq: ["$NFTOwner", NFTOwner] },
              ],
            },
          };
          SendDta.refMatch = {
            $expr: {
              $and: [{ $eq: ["$NFTId", "$$tId"] }, { $eq: ["$reported", false] }, Categorymatch],
            },
          };
          // SendDta.sort = { updatedAt: -1 };
          SendDta.refTable = "tokens";
          // SendDta.fromTable = TokenOwners;
        }

        if (TabName === "created") {
          
          SendDta.fromMatch = {
            "$expr": {
              "$and": [
                { "$ne": ["$NFTQuantity", "0"] },
                { "$eq": ["$NFTCreator", NFTOwner] },
                Categorymatch
              ],
            }
          };

          SendDta.refMatch = {
            "$expr": {
              "$and": [
                { "$eq": ["$NFTId", "$$tId"] },
                // { $eq: ["$PutOnSaleType", Status] }
  
  
  
  
              ]
            }
          }

          SendDta.refTable = "tokenowners";
          // SendDta.fromTable = Tokens;
        };
  
      }
 



      if (TabName == "usercollection") {
        SendDta.UserCollection = {
          chain: EvmChain.ETHEREUM,
          address: NFTOwner.toString().toLowerCase(),
          limit: Number(limit),
          cursor: cursor,
        };
      }

      if (TabName == "activity") {
        SendDta.sort = { updatedAt: -1 };
        SendDta.Tokens = ActivitySchema;
        SendDta.TabName = TabName
        SendDta.TokenMatch = {
          $expr: {
            $or: [{ $eq: ["$From", NFTOwner] }, { $eq: ["$To", NFTOwner] }],
          },
        };
      }

      if (TabName == "collection") {
  
        if (collectionfrom == "createpage") {
          Follow.Follow_Initial_Match = {
            $expr: {
              $and: [
                { $eq: ["$CollectionCreator", NFTOwner] },
                { $eq: ["$CollectionType", Type] }
              ],
            },
          };
        } else if (collectionfrom == "myitemscollection") {
          Follow.Follow_Initial_Match = {
            $expr: {
              $and: [
                { $eq: ["$CollectionCreator", WalletAddress] },
  
                Categorymatch
              ],
            },
          }
        }
  
        else {
          Follow.Follow_Initial_Match = {
            $expr: {
              $and: [
                { $ne: ["$CollectionCreator", ""] },
  
                Categorymatch
              ],
            },
          };
        }
  
        Follow.unwind = "$Following";
        Follow.from = "collection";
        Follow.fromTable = Collection;
      }
  
   
    const  RetData =
       TabName == "activity"
          ? await ActivityList(SendDta)
          : TabName == "usercollection"
            ? await UserCollection(SendDta.UserCollection, undefined)
            : TabName == "collection"
              ? await CollectionList(Follow, SendDta)
              :
              TabName == "created"
                ? await Created(SendDta)
                : await MyItemList(SendDta);

  
  res.status(200).json({status : true , message : "fetched", data : RetData})
// sendResponse(res,200,true,"fetched",RetData)  

  };


  export const CreateOrder = async (req, res) => {
    try {
      const {
        click,
        CollectionNetwork,
        CollectionName,
        NFTId,
        NFTName,
        Category,
        NFTDescription,
        NFTOrginalImage,
        NFTThumpImage,
        UnlockContent,
        ContractAddress,
        ContractType,
        NFTRoyalty,
        NFTProperties,
        CompressedFile,
        CompressedThumbFile,
        NFTOrginalImageIpfs,
        NFTThumpImageIpfs,
        MetaData,
        NFTCreator,
        NFTQuantity,
        PutOnSale,
        PutOnSaleType,
        NFTPrice,
        CoinName,
        ClockTime,
        EndClockTime,
        HashValue,
        NFTOwner,
        activity,
        NFTBalance,
        EmailId
      } = req.body;
  
      let TokenADd = await TokenOwnerADD(
        {
          CollectionNetwork,
          CollectionName,
          NFTId,
          NFTName,
          Category,
          NFTDescription,
          NFTOrginalImage,
          NFTThumpImage,
          UnlockContent,
          ContractAddress,
          ContractType,
          NFTRoyalty,
          NFTProperties,
          CompressedFile,
          CompressedThumbFile,
          NFTOrginalImageIpfs,
          NFTThumpImageIpfs,
          MetaData,
          NFTCreator,
          NFTQuantity,
          activity,
          from: "MarketPlace",
        },
        {
          PutOnSale,
          PutOnSaleType,
          NFTPrice,
          CoinName,
          ClockTime,
          EndClockTime,
          HashValue,
          NFTOwner,
          NFTBalance,
        }
      );
  
    // if (activity == "PutOnSale" && TokenADd.success == "success") var Send_Mail = await Node_Mailer({ Type: 'putonsale', EmailId: EmailId, Subject: 'Listing An NFT', OTP: '', click: click })
    // if (activity == "CancelOrder" && TokenADd.success == "success") var Send_Mail = await Node_Mailer({ Type: 'cancelorder', EmailId: EmailId, Subject: 'Cancel Price An NFT', OTP: '', click: click })
    // if(activity == "Lower" && TokenADd.success == "success") var Send_Mail   =   await Node_Mailer({Type:'lower',EmailId:EmailId,Subject:'Changing Price An NFT',OTP:'',click:click})
      await Activity({
        From:
          activity === "Mint"
            ? "NullAddress"
            : activity === "TransfersFiat"
              ? NFTCreator
              : NFTOwner,
        To: activity === "Mint" ? NFTCreator : NFTOwner,
        Activity: activity,
        NFTPrice: NFTPrice,
        Type: PutOnSale ? PutOnSaleType : "Not For Sale",
        CoinName: CoinName,
        NFTQuantity: NFTQuantity,
        NFTBalance: NFTBalance,
        HashValue: HashValue,
        NFTId: NFTId,
        ContractType: ContractType,
        ContractAddress: ContractAddress,
        CollectionNetwork: CollectionNetwork,
        Category: Category,
      });


      sendResponse(res,200,true,"success",TokenADd)
   
    } catch (e) {
   catchresponse(res , e)
    }
  };

 const BUY_ACCEPT_FUNC = async (item, newOwner) => {
    try {
      const { NFTId, ContractAddress, ContractType, NFTCreator } = item;
      const {
        NFTPrice,
        HashValue,
        NFTQuantity,
        NewTokenOwner,
        PutOnSale,
        PutOnSaleType,
        NFTOwner,
        activity,
      } = newOwner;
      if (NFTOwner) {

        let List = await  FindTokenOwners({ NFTOwner: NFTOwner, NFTId: NFTId } , {})
      console.log("ssssss" , List)
        if (List) {
          let Quantitys = Number(List.NFTBalance) - Number(NFTQuantity);
          let TokenADd = await TokenOwnerADD(
            { NFTId, ContractAddress, ContractType, NFTCreator },
            {
              NFTOwner,
              PutOnSaleType,
              PutOnSale,
              NFTBalance: Quantitys.toString(),
            }
          );
          if (TokenADd) {
            // let datas = {
            //   DBName: TokenOwners,
            //   FinData: { NFTOwner: NewTokenOwner, NFTId: NFTId },
            //   SelData: {},  
            // };
          
            let Lists = await FindTokenOwners({ NFTOwner : NewTokenOwner, NFTId : NFTId })
            let TokenADd1 = await TokenOwnerADD(
              { NFTId, ContractAddress, ContractType, NFTCreator },
              {
                NFTOwner: NewTokenOwner,
                NFTQuantity: String(List?.NFTQuantity),
                NFTBalance: Lists?.NFTBalance
                  ? String(Number(Lists?.NFTBalance) + Number(NFTQuantity))
                  : NFTQuantity,
                HashValue,
              }
            );
            return TokenADd1;
          } else return TokenADd;
        }
      } else return List;
    } catch (e) {
      console.error(e);
      return false
    }
  };

  export const BuyAccept = async (req, res) => {
try {
  

    let List = await BUY_ACCEPT_FUNC(req.body.item, req.body.newOwner);
  
    if (req.body.newOwner.activity === "Buy" && List.success === "success") {
      // await Node_Mailer({ Type: 'buy_owner', EmailId: req.body.newOwner.New_EmailId, Subject: 'Buying An NFT', OTP: '', click: req.body.newOwner.click })
      // var Send_Mail   =   await Node_Mailer({Type:'sell_owner',EmailId:req.body.newOwner.Old_EmailId,Subject:'Sold Out',OTP:'',click:req.body.newOwner.click})
    }
  
    if (List) {
      await Activity({
        From: req.body.newOwner.NFTOwner,
        To: req.body.newOwner.NewTokenOwner,
        Activity: req.body.newOwner.activity,
        NFTPrice: req.body.newOwner.TP,
        CoinName: req.body.newOwner.CN,
        NFTQuantity: req.body.newOwner.NFTQuantity,
        HashValue: req.body.newOwner.HashValue,
        NFTId: req.body.item.NFTId,
        CollectionNetwork: req.body.item.CollectionNetwork,
        ContractType: req.body.item.ContractType,
        ContractAddress: req.body.item.ContractAddress,
        Category: req.body.item.Category,
      });
      // let tokendetail = await Tokens.findOne({ NFTId: req?.body?.item?.NFTId })
      // let collectionget = await Collection.findOne({ CollectionSymbol: tokendetail?.CollectionSymbol })
      // let volumeupdate = await Collection.findOneAndUpdate({ CollectionSymbol: tokendetail?.CollectionSymbol }, { $set: { volume: (Number(collectionget?.volume) + Number(req.body.newOwner.USD)) } })
      let tokendetail = await   FindToken({ NFTId: req?.body?.item?.NFTId })
      let collectionget = await  FindCollection({ CollectionSymbol: tokendetail?.CollectionSymbol })
      let volumeupdate =  await FindCollectionandUpdate({ CollectionSymbol: tokendetail?.CollectionSymbol }, { $set: { volume: (Number(collectionget?.volume) + Number(req.body.newOwner.USD)) } })
  
    }

    return sendResponse(res,200, List ? true : false ,"fetched",List) 
  } catch (error) {
    console.error(error)
  catchresponse(res , error)
  }
  };


  export const BidAction = async (req, res) => {
    try {
      const {
        activity,
        EmailId,
        Category,
        TokenBidderAddress,
        CollectionNetwork,
        TokenBidderAddress_Name,
        HashValue,
        TokenBidAmt,
        ContractType,
        ContractAddress,
        NFTId,
        from,
        NFTOwner,
        CoinName,
        click,
      } = req.body;
      const NFTQuantity = Number(req.body.NFTQuantity);

      let FinData = {
          TokenBidderAddress: TokenBidderAddress,
          NFTId: NFTId,
          ContractAddress: ContractAddress,
          ContractType: ContractType,
          deleted: 1,
          Pending: { $gt: 0 },
      };

      let List = await FindOneBid(FinData);
      if (List) {
        let update = req.body;
        if (from == "Edit") {
          // update.NFTQuantity = NFTQuantity;
          // update.Pending = NFTQuantity - List.msg.Completed;
          update.NFTQuantity = NFTQuantity + List.Completed;
          update.Pending = NFTQuantity;
          update.status = "pending";
        } else if (from == "Cancel") {
          update.Pending = List.Pending - NFTQuantity;
          update.Cancel = List.Cancel + NFTQuantity;
          update.status = "cancelled";
        } else if (from == "accept") {
          update.Pending = List.Pending - NFTQuantity;
          update.status = List.Pending == NFTQuantity ? "completed" : "pending";
          update.Completed =
            List.Pending == NFTQuantity
              ? NFTQuantity
              : List.Completed + NFTQuantity;
        }
   
        let Find_data =  FinData
        let Updata_data = update
        var Finds = await FindOneBidandUpdata(Find_data , Updata_data ,{ new: true } );
        if (from == "accept") {
          var tok = await BUY_ACCEPT_FUNC(req.body.item, req.body.newOwner);
          if (req.body.newOwner.activity == "Accept" && List) {
            // var Send_Mail = await Node_Mailer({ Type: 'accept', EmailId: req.body.newOwner.New_EmailId, Subject: 'Buying An NFT', click: req.body.newOwner.click })
            // var Send_Mail   =   await Node_Mailer({Type:'sell_owner',EmailId:req.body.newOwner.Old_EmailId,Subject:'Sold An Nft',click:req.body.newOwner.click})
          }
          await Activity({
            From: req.body.newOwner.NFTOwner,
            To: req.body.newOwner.NewTokenOwner,
            Activity: req.body.newOwner.activity,
            NFTPrice: req.body.newOwner.TP,
            CoinName: req.body.newOwner.CN,
            NFTQuantity: req.body.newOwner.NFTQuantity,
            HashValue: req.body.newOwner.HashValue,
            NFTId: req.body.item.NFTId,
            CollectionNetwork: req.body.item.CollectionNetwork,
            ContractType: req.body.item.ContractType,
            ContractAddress: req.body.item.ContractAddress,
            Category: req.body.newOwner.Category,
          });
          sendResponse(res , 200 , true , "success" , tok)
          
        } else {
          if ((from == "Edit" || from == "Cancel") && Finds) {
            // if(activity == "Edit" ) var Send_Mail   =   await Node_Mailer({Type:'edit_bid',EmailId:EmailId,Subject:'Edit Offer For A NFT',OTP:'',click:click})
            // if(activity == "Cancel" ) var Send_Mail   =   await Node_Mailer({Type:'cancel_bid',EmailId:EmailId,Subject:'Cancel Offer For A NFT',OTP:'',click:click})
  
            await Activity({
              From: NFTOwner,
              To: TokenBidderAddress,
              Activity: activity,
              NFTPrice: TokenBidAmt,
              CoinName: CoinName,
              NFTQuantity: NFTQuantity,
              HashValue: HashValue,
              NFTId: NFTId,
              ContractType: ContractType,
              ContractAddress: ContractAddress,
              CollectionNetwork: CollectionNetwork,
              Category: Category,
            });
          }
          sendResponse(res , 200 , true , "success" , Finds)
          
        }
      } else {
        let datas = req.body
     
        datas.Pending = NFTQuantity;

        let List = await SaveBid(datas);
        if (List) {
          if (activity == "Bid")          {
            //  await Node_Mailer({ Type: 'bid', EmailId: EmailId, Subject: 'Make Offer For A NFT', OTP: '', click: click })

          } 
  
          await Activity({
            From: NFTOwner,
            To: TokenBidderAddress,
            Activity: activity,
            NFTPrice: TokenBidAmt,
            CoinName: CoinName,
            NFTQuantity: NFTQuantity,
            HashValue: HashValue,
            NFTId: NFTId,
            Category: Category,
            ContractType: ContractType,
            ContractAddress: ContractAddress,
            CollectionNetwork: CollectionNetwork,
          });
        }
        sendResponse(res , 200 , true , "success" , List)
       
      }
    } catch (e) {
      catchresponse(res , e)
    
    }
  };


// old Activity
  export const Activity_api = async (req, res) => {
    try{


    let {
      TabName,
      limit,
      CustomUrl,
      WalletAddress,
      NFTOwner,
      page,
      from,
      cursor,
      filter,
      NFTid
    } = req.query;

    let SendDta = {};
    SendDta.limit = parseInt(limit) ?? 1;
    SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
    SendDta.CustomUrl = CustomUrl;
    SendDta.from = from;




    if (from == "Activity") {
      SendDta.sort = { updatedAt: -1 };
      // SendDta.Tokens = ActivitySchema;
      SendDta.TabName = TabName
  
    }

    if (TabName == "Activity") {
      SendDta.TokenMatch = {
        $expr: {
          $ne: ['$Activity', '']
        },
      };
    }
    if (TabName == "TokenActivity") {
      SendDta.TokenMatch = {
        $expr: {
          $eq: ['$NFTId', NFTid]
        },
      };
    }
   
    if (TabName == "Sales") {
      SendDta.TokenMatch = {
        $expr: {
          $eq: ['$Activity', 'Buy']
        },
      };
  
    }
  
    if (TabName == "Listing") {
      SendDta.TokenMatch = {
        $expr: {
          $eq: ['$Activity', 'Mint']
        },
      };
  
      if (TabName == "Bids") {
        SendDta.TokenMatch = {
          $expr: {
            $eq: ['$Activity', 'Bid']
          },
        };
    
    
      }
  
    }
    if (TabName == "Purchase") {
      SendDta.TokenMatch = {
        $expr: {
          $eq: ['$Activity', 'Buy']
        },
      };
  
  
  
    }
  
    const RetData = await ActivityList(SendDta)
     
  

    sendResponse(res, 200,RetData ? true : false , RetData ? "fetched successfully" : "no data found ", RetData)
   
  
  }
  catch(error){
    catchresponse(res , error)
  }
  
  
  }


  export const CollectionByCreator = async (req, res) => {
    try{
    const { Creator, Type, tab, filter, limit, page, from, single, symbol, Categoryname } = req?.query;

console.log("req.query",req.query)   
    let RetData;
    if (from == 'home') {
      var SendData = {
        match: !tab
          ? {
            $expr: {
              $and: [
                // { $eq: ["$CollectionType", Type] },
                { $eq: ["$CollectionCreator", Creator] },
              ],
            },
          }
          : (tab == "All" ? {} : { Category: tab }),
  
        limit: !tab ? Number.MAX_SAFE_INTEGER : 3,
        sort: { "Tokens.updatedAt": tab == "old" ? 1 : -1 },
        // DBNAME: Collection,
        tokenMatch: { $expr: { $eq: ["$CollectionSymbol", "$$symbol"] } },
        skip: page * limit - limit, //
        CollLimit: page * limit, //page*limit
        tab: tab,
        filter: filter
      };
      RetData = await HomeCollectionFunc(SendData);
    }
    // just for data old collctiondetails
if(from === 'collctiondetailonly'){
  var SendDta = {}
  SendDta.from = from



  SendDta.CollcetionsMatch = {
    $expr: {
      $and: [
        { $eq: ["$CollectionSymbol", symbol] },
      ],
    },
  };
  SendDta.limit = parseInt(limit),
    SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;

  // RetData = await CollectionListHome(SendDta);
  RetData = await forcollection(SendDta)
}
    if (from == 'collctiondetails') {
   
     
      const result = await exploretokenservice(req.query)
console.log("ssssssss",result)
     return  res.status(200).json({
      statuscode : 200 ,
        status: true,
        message: "fetched",
        data: result
      })

    //  sendResponse(res, 200, result ? true : false , result ? "fetched" : "nodatafound" , result)

      var SendDta = {}
      SendDta.from = from
      // SendDta.filter =  filter
      // SendDta.DBName = collection
      // SendDta.Tokens = Tokens //db
      SendDta.sort = { "tokenowners_list.updatedAt": -1 };

      if (filter == "PriceLowToHigh") {

        SendDta.sort = { "NFTPrice": 1 };
      } 
       if (filter == "PriceHighToLow") {
  
        SendDta.sort = { "NFTPrice": -1 };
      }
      if (filter == "oldest") {
        SendDta.sort = { "tokenowners_list.updatedAt": 1 };
  
      } 


      SendDta.CollcetionsMatch = {
        $expr: {
          $and: [
            { $eq: ["$CollectionSymbol", symbol] },
          ],
        },
      };
      SendDta.limit = limit,
        SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
  
      RetData = await CollectionListHome(SendDta);
    }
    if (from == 'collctionpage') {

      
      let SendDta = {}
      SendDta.from = from
      SendDta.Categoryname = Categoryname
      if (filter == "PLTH") {
        SendDta.pricesort = { "$sort": { "Tokens.floorprice": -1 } }
      }
      if (filter == "PHTL") {
        SendDta.pricesort = { "$sort": { "Tokens.floorprice": 1 } }
  
      }
      if (filter == "recentlycreated") {
        SendDta.statussort = { "$sort": { "updatedAt": -1 } }
  
      }
      if (filter == "oldest") {
        SendDta.statussort = { "$sort": { "updatedAt": 1 } }
  
      }
      let cat = Categoryname === 'All' ? { $ne: ["$Category", ""] } : { $eq: ["$Category", Categoryname] }
      // SendDta.DBName = collection
      // SendDta.Tokens = Tokens // db 
  
      SendDta.CollcetionsMatch = {
        $expr: {
          $and: [
            { $ne: ["$CollectionSymbol", ""] }, cat
          ],
        },
      };

      SendDta.limit = parseInt(limit),
        SendDta.skip = ((page ? parseInt(page) : 1) - 1) * parseInt(limit);
  
      RetData = await forcollection(SendDta);
    }
   if (from == 'create') {
      var SendData = {
        match: !tab
          ? {
            $expr: {
              $and: [
                { $eq: ["$CollectionType", Type] },
                { $eq: ["$CollectionCreator", Creator] },
         
              ],
            },
          }
          : (tab == "All" ? {} : { Category: tab }),
  
        limit: !tab ? Number.MAX_SAFE_INTEGER : 3,
        sort: { "Tokens.updatedAt": tab == "old" ? 1 : -1 },
        // DBNAME: Collection,
        tokenMatch: { $expr: { $eq: ["$CollectionSymbol", "$$symbol"] } },
        skip: 0, //
        CollLimit: 8, //
        tab: tab,
        filter: filter
      };
      RetData = await CreateCollectionFunc(SendData);
    }
    if(from == 'collection'){ 

      const SendData = {
        match: !tab
          ? {
            $expr: {
              $and: [
                { $eq: ["$CollectionType", Type] },
                { $eq: ["$CollectionCreator", Creator] },
              ],
            },
          }
          : (tab == "All" ? {} : { Category: tab }),
        limit: !tab ? Number.MAX_SAFE_INTEGER : 3,
        sort: { "Tokens.updatedAt": tab == "old" ? 1 : -1 },
        DBNAME: Collection,
        tokenMatch: { $expr: { $eq: ["$CollectionSymbol", "$$symbol"] } },
        skip: 0, //
        CollLimit: 8,
        tab: tab,
        filter: filter
      };
      RetData = await CreateCollectionFunc(SendData);
      return  res.status(200).json({status : true , message : "successfully",data : RetData})
      
    }
    return  res.status(200).json({status : true , message : "successfully",data: RetData})
    // sendResponse(res , 200 , true , "fetched successfully" , RetData)
  }catch(error){
    console.log(error)
    catchresponse(res , error);
  }
  };
  export const EditCollectionByCreator = async (req, res) => {
    try {
      const {
        CollectionName,
        CollectionSymbol,
        CollectionBio,
        Category,
        CollectionType,
        CollectionNetwork,
        CollectionCreator,
        CollectionContractAddress,
        CollectionProfileImage,
        CollectionCoverImage
  
      } = req?.body
      // if(req?.files)
      // { 
  
      const ref = Date.now();
      let data_already_token = { DBName: Collection, FinData: { CollectionSymbol: CollectionSymbol }, SelData: { CollectionSymbol: 1 } };
      let data_already_token_list = await MongooseHelper.FindOne(data_already_token);
      if (data_already_token_list.success == "success") {
        if (req?.files) {
          const { CollectionProfileImage, CollectionCoverImage } = req?.files;
  
          var profile = CollectionProfileImage
            ? await ImageAddFunc([
              {
                path: `public/collection/profile/${CollectionSymbol}/`,
                files: CollectionProfileImage,
                filename: ref + "." + "webp",
              },
            ])
            : "";
  
          var cover = CollectionCoverImage
            ? await ImageAddFunc([
              {
                path: `public/collection/cover/${CollectionSymbol}/`,
                files: CollectionCoverImage,
                filename: ref + "." + "webp",
              },
            ])
            : "";
        }
  
        const Data = {
          CollectionName,
          CollectionSymbol,
          CollectionBio,
          CollectionType,
          CollectionNetwork,
          CollectionCreator,
          CollectionProfileImage: profile ? profile : CollectionProfileImage,
          CollectionCoverImage: cover ? cover : CollectionCoverImage,
          CollectionContractAddress,
          Category,
        }
        const update = await  FindCollectionandUpdate({ CollectionSymbol: CollectionSymbol } , Data , { new: true } )
       sendResponse(res , 200 , update? true : false ,"collection Updated Successfully")
      }
      else {
        sendResponse(res,200,false,"collection not exits")
       
      }
  
    } catch (error) {
        catchresponse(res , error);
    }
  
  }


  export const CollectionBySymbol = async (req, res) => {
    try{
    const { CollectionSymbol } = req.query;
        let List = await FindCollection(CollectionSymbol)
        sendResponse(res,200 , List ? true : false , "fetched successfully" , List)  
    }catch(error){
        catchresponse(res , error);
    }

  };

  export const ListCollectionNFT = async (req, res) => {
    let saved ={}
    try {
      const {
        click,
        CollectionNetwork,
        CollectionName,
        NFTId,
        NFTName,
        Category,
        NFTDescription,
        NFTOrginalImage,
        NFTThumpImage,
        UnlockContent,
        CollectionSymbol,
        ContractAddress,
        ContractType,
        NFTRoyalty,
        NFTProperties,
        CompressedFile,
        CompressedThumbFile,
        NFTOrginalImageIpfs,
        NFTThumpImageIpfs,
        MetaData,
        MetFile,
        NFTCreator,
        NFTQuantity,
        PutOnSale,
        PutOnSaleType,
        NFTPrice,
        CoinName,
        ClockTime,
        EndClockTime,
        HashValue,
        NFTOwner,
        activity,
        NFTBalance,
        ownBalance
      } = req.body;
      let tokenownerid = [];
      let promises = NFTOwner.map(async (val, ind) => {
        // const Already = {
        
        //     NFTId: NFTId,
        //     NFTOwner: val
          
        //   SelData: { _id: 0, NFTRoyalty: 1, NFTBalance: 1 },
        // };
        const already_token_list = await FindTokenOwners({ 
          NFTId: NFTId,
          NFTOwner: val  } , { _id: 0, NFTRoyalty: 1, NFTBalance: 1 } );

        if (already_token_list?.NFTBalance) {
          return sendResponse(res , 409 , false , "Token Already Listed" );
        }
        else {
           saved = {
            CollectionNetwork,
            CollectionName,
            MetFile,
            CollectionSymbol,
            NFTId,
            NFTName,
            Category,
            NFTDescription,
            NFTOrginalImage,
            NFTThumpImage,
            UnlockContent,
            ContractAddress,
            ContractType,
            NFTRoyalty,
            NFTProperties,
            CompressedFile,
            CompressedThumbFile,
            NFTOrginalImageIpfs,
            NFTThumpImageIpfs,
            MetaData,
            NFTCreator: NFTOwner[0],
            NFTQuantity: ownBalance[ind],
            activity,
            PutOnSale,
            PutOnSaleType,
            NFTPrice,
            CoinName,
            ClockTime,
            EndClockTime,
            HashValue,
            NFTOwner: val,
            NFTBalance: ownBalance[ind],
            Status: "list",
          };
          let saveowner = await SaveTokenOwners( saved );
          await Activity({
            From:
              (activity === "Mint" || activity === "List")
                ? "NullAddress"
                : activity === "TransfersFiat"
                  ? NFTCreator
                  : NFTOwner,
            To: (activity === "Mint") ? NFTCreator : val,
            Activity: activity,
            NFTPrice: NFTPrice,
            Type: PutOnSale ? PutOnSaleType : "Not For Sale",
            CoinName: CoinName,
            NFTQuantity: ownBalance[ind],
            HashValue: HashValue,
            NFTId: NFTId,
            ContractType: ContractType,
            ContractAddress: ContractAddress,
            CollectionNetwork: CollectionNetwork,
            Category: Category,
            CollectionSymbol: CollectionSymbol,
          });
          if (saveowner) {
            tokenownerid.push(saveowner.data._id);
          }
        }
      })
      Promise.all(promises).then(async () => {
         saved = {
          CollectionNetwork,
          CollectionName,
          MetFile,
          CollectionSymbol,
          NFTId,
          NFTName,
          Category,
          NFTDescription,
          NFTOrginalImage,
          NFTThumpImage,
          UnlockContent,
          ContractAddress,
          ContractType,
          NFTRoyalty,
          NFTProperties,
          CompressedFile,
          CompressedThumbFile,
          NFTOrginalImageIpfs,
          NFTThumpImageIpfs,
          MetaData,
          NFTCreator,
          NFTQuantity,
          activity,
          PutOnSale,
          PutOnSaleType,
          NFTPrice,
          CoinName,
          ClockTime,
          EndClockTime,
          HashValue,
          NFTOwner,
          NFTBalance,
          NFTOwnerDetails: tokenownerid,
          Status: "list",
        }
  
        const TokenADd = await SaveToken(saved );
        return sendResponse(res , 200 , true , "fetched" , TokenADd );
       
      })
    } catch (err) {
     
      catchresponse(res , err);
    }
  }
  


//   export const OpenSeaUpdations = async (data) => {
//     console.log("data For Updations", data);
  
//     try {
//         if (data) {
//             var SplitForTokenId = data?.payload?.item?.nft_id?.split("/");
//             console.log("SplitForTokenId", SplitForTokenId, SplitForTokenId[2]);
//             var SearchAddress = data?.event_type == "item_transferred" ? data?.payload?.from_account?.address : data?.payload?.maker?.address
//             var FindUsersNFTs = await TokenOwnersDb.findOne({ tokenID: SplitForTokenId[2], tokenOwner: SearchAddress })
//             console.log("FindUsersNFTs", FindUsersNFTs);
//             if (FindUsersNFTs && (data?.event_type !== "item_transferred" && data?.event_type !== "item_sold")) {
//                 var UpdateData
//                 if (data?.event_type == "item_listed") {
//                     console.log("data?.event_type", data?.event_type);
//                     var DecimalPrice = ((data?.payload?.base_price) / 1e18)
//                     var EachNftPrice = (DecimalPrice / data?.payload?.quantity)
//                     console.log("EachNftPrice", EachNftPrice);
//                     UpdateData = { tokenPrice: Number(EachNftPrice), timestamp: Date.now(), PutOnSale: "true" }
//                 } else if (data?.event_type == "item_cancelled") {
//                     UpdateData = { tokenPrice: Number(0), PutOnSale: "false", timestamp: Date.now() }
//                 } else if (data?.event_type == "item_cancelled") {
//                     UpdateData = { tokenPrice: Number(0), timestamp: Date.now() }
//                 }
//                 console.log("UpdateData", UpdateData);
//                 const UpdateContent = await TokenOwnersDb.findOneAndUpdate({ tokenID: SplitForTokenId, tokenOwner: data?.payload?.maker?.address }, { $set: UpdateData }, { new: true })
//                 console.log("UpdateContent", UpdateContent);
//                 if (UpdateContent) {
//                     return UpdateContent
//                 } else {
//                     return null
//                 }
//             } else if (data?.event_type == "item_transferred" || data?.event_type == "item_sold") {
//                 console.log("data?.event_type Comming on Else", data?.event_type);
//                 let ToAddress = data?.event_type == "item_sold" ? data?.payload?.taker?.address?.toLowerCase() : data?.payload?.to_account?.address?.toLowerCase()
//                 let FromAddress = data?.event_type == "item_sold" ? data?.payload?.maker?.address?.toLowerCase() : data?.payload?.from_account?.address?.toLowerCase()
//                 let NFTOwner = {
//                     tokenID: SplitForTokenId[2],
//                     tokenOwner: ToAddress,
//                     tokenCreator: FromAddress,
//                     status: true,
//                     PutOnSale: false,
//                     tokenPrice: 0,
//                     coinname: "MATIC",
//                     balance: data?.payload?.quantity,
//                     quantity: data?.payload?.quantity,
//                     contractAddress: "0x11b782509759f01e1c01efde368a758c1f0c8b8b".toLowerCase(),
//                     type: FindUsersNFTs.type,
//                     previousPrice: 0,
//                     SelectedNetwork: "Polygon",
//                     Fiat: "Crypto",
//                     BuyType: "Crypto",
//                     RandomName: FindUsersNFTs?.RandomName,
//                     NonceHash: FindUsersNFTs?.NonceHash,
//                     SignatureHash: FindUsersNFTs?.SignatureHash,
//                     additionalImage: FindUsersNFTs?.additionalImage,
//                     ipfsmeta: FindUsersNFTs?.ipfsmeta,
//                     image: FindUsersNFTs?.image,
//                     ipfsimage: FindUsersNFTs?.ipfsimage,
//                     tokenName: FindUsersNFTs?.tokenName,
//                     searchtext: FindUsersNFTs?.tokenName.toLowerCase(),
//                     tokenDesc: FindUsersNFTs?.tokenDesc,
//                     tokenCategory: "OpenSea",
//                     tokenProperty: FindUsersNFTs?.tokenProperty,
//                 };
//                 const TokenOwnersFind = await TokenOwnersDb.findOne({ tokenID: SplitForTokenId[2], tokenOwner: ToAddress })
//                 if (TokenOwnersFind == null) {
//                     let  OwnerUpdate
//                     if (Number(FindUsersNFTs.quantity) > 1) {
//                         OwnerUpdate = { quantity: Number(FindUsersNFTs.quantity) - Number(data?.payload?.quantity) }
//                     } else {
//                         OwnerUpdate = { quantity: 0, tokenPrice: 0, PutOnSale: false, timestamp: Date.now() }
//                     }
//                     console.log("OwnerUpdate", OwnerUpdate);
//                     var UpdatePreviousOwner = await TokenOwnersDb.findOneAndUpdate({ tokenID: SplitForTokenId[2], tokenOwner: FromAddress }, { $set: OwnerUpdate }, { new: true })
//                     var NewNFTOwner = new TokenOwnersDb(NFTOwner);
//                     var TokenOwnersave = await NewNFTOwner.save()
//                     console.log("TokenSaveTokenOwnersave", TokenOwnersave);
//                 } else {
//                     let  OwnerUpdate1
//                     if (Number(FindUsersNFTs.quantity) > 1) {
//                         OwnerUpdate1 = { quantity: Number(FindUsersNFTs.quantity) - Number(data?.payload?.quantity,) }
//                     } else {
//                         OwnerUpdate1 = { quantity: 0, tokenPrice: 0, PutOnSale: false, timestamp: Date.now() }
//                     }
//                     var UpdatePreviousOwner = await TokenOwnersDb.findOneAndUpdate({ tokenID: SplitForTokenId[2], tokenOwner: FromAddress }, { $set: OwnerUpdate1 }, { new: true })
//                     const UpdateCurrentOwner = await TokenOwnersDb.findOneAndUpdate({ tokenID: SplitForTokenId[2], tokenOwner: ToAddress }, { $set: { quantity: Number(TokenOwnersFind.quantity) + Number(data?.payload?.quantity), balance: Number(TokenOwnersFind.balance) + Number(data?.payload?.quantity) } }, { new: true })
//                     if (UpdateCurrentOwner) {
//                         return UpdateCurrentOwner
//                     } else {
//                         return null
//                     }
//                 }
//             }
//         }
//     } catch (e) {
//         console.log("OpenSeaUpdation Catch", e);
//     }
// }

export const getOwnerOf721Token = async (contractAddress, tokenId) => {
  try {
      const OpenSeaAbi = require("../../config/ABI/721.json");
      const RPC_URL = "https://mainnet.infura.io/v3/a5b1545221004abcb3fc2f97bb176596";
      const httpProvider = new Web3.providers.HttpProvider(RPC_URL);
      const web3 = new Web3(httpProvider);
      
      const contract = new web3.eth.Contract(OpenSeaAbi, contractAddress);
      // console.log("contract" , contract)
      if (contract) {
          const owner = await contract.methods.ownerOf(tokenId).call();
          console.log("contract" , owner)
          return owner;
      } else {
          return null; // Contract not found or invalid
      }
  } catch (error) {
      console.error("Error getting owner of 721 token:", error);
      return null;
  }
};


export const BalanceOfOpenSeaNfts = async (data) => {
  console.log("BalanceOf", data);
  const OpenSeaAbi = require("../../config/ABI/openseaabi.json");
  try {
      const RPC_URL = "https://mainnet.infura.io/v3/a5b1545221004abcb3fc2f97bb176596"
      //"https://polygon-mainnet.infura.io/v3/a6738b5a17514327ae8c9afc47b6179c";
      const httpProvider = new Web3.providers.HttpProvider(RPC_URL);
      const web3 = new Web3(httpProvider);
      const CONTRACT = new web3.eth.Contract(OpenSeaAbi, data.NFTConAddress);
      if (CONTRACT) {
          console.log("...data?.Data", ...data?.Data);
          var balance = await CONTRACT.methods.balanceOf(...data?.Data).call();
          console.log("balancebalance", balance);
          return { balance: balance }
      } else {
          return false
      }
  } catch (error) {
      console.log("errrorororrorororo", error);
      return false
  }
}

export const OpenSeaFetch = async (req , res ) => {
  await OpenSeaFetchNFT()
  res.status(200).json({status : true , message : "OpenSeaFetch triggered!" })
}
export const OpenSeaFetchNFT = async () => {
    // console.log("req", req.?body);
    try {
      const axios = require('axios')
        const sdk = require('api')('@opensea/v2.0#hbu2zlsaz6n88');
        // sdk.auth('c364a24fb2ee4ab6b72df0f8312517f9');
        sdk.auth('9791cc4835a24e6da4798f64dcec095b');
        sdk.server('https://testnets-api.opensea.io');
        // sdk.server('https://opensea.io');

  // const ContractAddress = config.CONTRACTADDRESS
  const ContractAddress = ['0x362836C8be9f0487309cf962cc36Ed6e90177937']

  // const Collectioslug = config.SLUGS;
  const Collectioslug = ['galficollection721'];
  // const ContractAddressCreator = config.Collectioncreator
  const ContractAddressCreator = ['0x362836C8be9f0487309cf962cc36Ed6e90177937']

  for(let i = 0 ; i <  ContractAddress.length ; i++){

        console.log(Collectioslug[i])
        const  NFTsList = await sdk.list_nfts_by_collection({limit: '10', collection_slug: Collectioslug[i]})
        console.log(JSON.stringify(NFTsList))

for (let j = 0 ; j < NFTsList?.data?.nfts.length ; j++ ){
  const Item = NFTsList?.data?.nfts[j]
  console.log("____xxx_>" ,Item )
            let ownerofnft = ""

            const NFTFind = await TokenDb.findOne({ NFTId: Item?.identifier, Category : Item?.collection })
            console.log("____xxx_NFTFind>" , NFTFind)
   
            if (!NFTFind) {

// let NFTdata = await sdk.get_nft({
//   chain: 'ethereum',
//   address: ContractAddress[i].toLowerCase(),
//   identifier: Item?.identifier,
// })
let NFTdata = await sdk.get_nft({
  chain: config.OPENSEANETWORK,
  address: Item?.contract.toLowerCase(),
  identifier: Item?.identifier,
})
console.log("____xxx_x>" ,NFTdata )
NFTdata = NFTdata?.data

const ipfsUrl = Item?.image_url;
// const ext = Item?.image_url.split
const finename = Date.now() + ".webp";
const filename = `public/nft/${NFTdata.nft?.creator}/Compressed/${finename}`;
const uploadimagpath = `/nft/${NFTdata.nft?.creator}/Compressed/${finename}`
const saveipfsimage = await saveIpfsData(ipfsUrl, filename); 
             console.log( NFTdata?.nft?.traits) 
let transformedData  = []
             if(NFTdata?.nft?.traits){
               transformedData = NFTdata?.nft?.traits.map(item => ({ [item.trait_type]: item.value }));
             }



               const  NFT = {
                  NFTId: NFTdata.nft?.identifier,
                  NFTName: NFTdata.nft?.name,
                  NFTDescription : NFTdata.nft?.description ? NFTdata.nft?.description : '',
                  Category : NFTdata.nft?.collection, 
                  CollectionName : NFTdata.nft?.collection, 
                  CollectionSymbol : Item?.collection ,
                  Collection: Item?.collection,
                  tokenPrice: 'unlimited',
                  NFTProperties :  transformedData ,
                  tokenOwner: NFTdata.nft?.owners ? NFTdata.nft?.owners[0]?.address :  NFTdata.nft?.creator ,
                  NFTCreator:  NFTdata.nft?.creator,
                  NFTQuantity: Item?.token_standard === "erc721" ? '1' : NFTdata.nft?.owners[0]?.quantity ,
                  // balance: BalanceOfTotalSupply?.balance,
                  openSeaUrl : Item?.opensea_url , 
                  ContractAddress: Item?.contract,
                  status: true,
                  ContractType : Item?.token_standard === "erc721" ? "721" : "1155",

                  animation_url : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url  :'',
                  NFTThumpImageIpfs : NFTdata.nft?.animation_url ? Item?.image_url : '',
                  NFTOrginalImageIpfs : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url  : Item?.image_url,
                  image_url : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url : uploadimagpath  , 
                  image_thumb_url :  NFTdata.nft?.animation_url ? uploadimagpath : "" ,
                  NFTOrginalImage : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url : NFTdata.nft?.image_url ,
                  NFTThumpImage :  NFTdata.nft?.animation_url ? NFTdata.nft?.image_url : NFTdata.nft?.image_url ,
                  CompressedFile :NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url : NFTdata.nft?.image_url  ,
                  CompressedThumbFile : NFTdata.nft?.image_url  ,
                  MetaData: Item?.metadata_url,
                  RandomName : Item?.RandomName,
                  NonceHash: Item?.NonceHash,
                  SignatureHash: Item?.SignatureHash,
                  BuyType: config.OPENSEANETWORK ,
                  CollectionNetwork: config.OPENSEANETWORK,
                  Owners :   NFTdata.nft?.owners ,
                  next : NFTsList.data?.next ? NFTsList.data?.next : null
              };


                const  NFTOwner = {
                  NFTId:  NFTdata.nft?.identifier,
                  NFTName:  NFTdata.nft?.name,
                  NFTOwner:  NFTdata.nft?.owners ? NFTdata.nft?.owners[0]?.address :  NFTdata.nft?.creator,
                  tokenowner:   NFTdata.nft?.creator,
                    PutOnSale : false,
                    NFTPrice: '',
                    CoinName: config.OPENSEANETWORK ,
                    // deleted: OwnerCheck ? 1 : 0,
                    Category:  Item?.collection, 
                    CollectionName : Item?.collection, 
                    ContractAddress: Item?.contract,
                    NFTBalance : Item?.token_standard === "erc721" ?  '1'  : NFTdata.nft?.owners[0]?.quantity ,
                    NFTQuantity : Item?.token_standard === "erc721" ? '1' : NFTdata.nft?.owners[0]?.quantity  ,
                    NFTtype : Item?.token_standard == "erc1155" ? 1155 : 721,
                  
                    BuyType: config.OPENSEANETWORK ,
                    RandomName: Item?.RandomName,
                    NonceHash: Item?.NonceHash,
                    SignatureHash: Item?.SignatureHash,
                    Platform : "OpenSea",
                 
                };

              
                    const NewNFT = new TokenDb(NFT);
                     await NewNFT.save()
                 
                
                const TokenOwnersFind = await TokenOwnersDb.findOne({ tokenID: Item?.identifier, Category:  Item?.collection  })
                if (!TokenOwnersFind) {
                    const NewNFTOwner = new TokenOwnersDb(NFTOwner);
                    const TokenOwnersave = await NewNFTOwner.save()
       

      await Activity({
        From: "NullAddress",
        To: Item?.token_standard === "erc721" ? ownerofnft.toLowerCase() : "0x025c1667471685c323808647299e5DbF9d6AdcC9".toLowerCase(),
        Activity: "Mint",
        NFTPrice: '',
        Type:  "Not For Sale",
        CoinName: "ethereum",
        NFTQuantity: Item?.token_standard === "erc721" ?  1  :  NFTdata.nft?.owners[0]?.quantity,
        NFTBalance:  Item?.token_standard === "erc721" ?  1  :  NFTdata.nft?.owners[0]?.quantity,
        HashValue: Item?.NonceHash ,
        NFTId: Item?.identifier,
        NFTName: Item?.name,
        ContractType: Item?.token_standard == "erc1155" ? 1155 : 721,
        ContractAddress: Item?.contract ,
        CollectionNetwork: config.OPENSEANETWORK ,
        Category:  Item?.collection,
        SignatureHash: Item?.SignatureHash,
      });


                }
            }
       
          

        }

      

}

   
    } catch (e) {
      console.error("Error in opeseafetch",e)
      // const FindNFTsDet = await TokenOwnersDb.find({ deleted: 1, quantity: { $gt: 0 } })
      // OpenSeaFetchNFT()
    }
};


export const StackNft = async(req , res )=>{
try{

const { nftid , WalletAddress , poolID  , startDate , endDate , totalStakeDays ,lastRewardDay, 
  lastReward , Season , withdraw , collectionname , collectionaddress , transcationhash

} = req.body
console.log("llstac" ,  req.body)

const payload = {

  NFTId: nftid ,
  walletAddress: WalletAddress ,
  poolId: poolID ,
  startDate: startDate ,
  endDate: endDate ,
  totalStakeDays: totalStakeDays ,
  lastRewardDay: lastRewardDay,
  lastReward: lastReward ,
  transcationhash : transcationhash ,

} 
const findalreadyexist = await StakeDb.findOne({ NFTId: nftid , walletAddress: WalletAddress })

if(findalreadyexist){
  return sendResponse(res, 200, false  , "already stacked")
  }

const Item = await TokenDb.findOne({ NFTId: nftid })
console.log("ItemItem" , Item)
  if(!Item){
  return sendResponse(res, 404, false  , "nft not found ")
  }


const stackcreate = await StakeDb.create(payload)

const tokenownerup = await TokenOwnersDb.findOneAndUpdate({ NFTId: nftid , NFTOwner: WalletAddress } , {   PutOnSale : false , PutOnSaleType : 'Stake' } )


await Activity({
  From: WalletAddress ,
  To: "Stakeaddress",
  Activity: "Stake",
  NFTPrice: '',
  Type:  "Not For Sale",
  CoinName: Item?.CoinName ,
  NFTQuantity: '',
  NFTBalance: '' ,
  HashValue: transcationhash ,
  NFTId: nftid ,
  NFTName: Item?.NFTName ,
  ContractType: Item?.ContractType , 
  ContractAddress: Item?.ContractAddress  ,
  CollectionNetwork: Item?.CollectionNetwork ,
  Category:  Item?.Category ,
});



return sendResponse(res, 200, stackcreate?  true : false  ,stackcreate?  "stacked successfully" : "stacked failed" , stackcreate)
}catch(error){
  console.log("error" , error)
  catchresponse(res , error)
}

}


export const WithdrawNFT = async(req , res )=>{
  try{
const {nftid , WalletAddress , transcationhash} = req.body

// const TokenOwnersDb = require('./schema/tokenowner.schema')
// const TokenDb= require('./schema/token.schema')
// const StakeDb = require('./schema/stake.schema')


const Item = await TokenDb.findOne({ NFTId: nftid })

if(!Item){
  return sendResponse(res , 404 , false , 'nft not found')
}

const check = await StakeDb.findOne({ NFTId: nftid , walletAddress: WalletAddress })
const cuurdate = new Date()
if(cuurdate > check?.endDate){
  return sendResponse(res , 200 , false , 'cannot withdraw please come another day')

}

const update = await StakeDb.findOneAndUpdate({ NFTId: nftid , walletAddress: WalletAddress } , {withdraw: true })
const tokenownerup = await TokenOwnersDb.findOneAndUpdate({ NFTId: nftid , NFTOwner: WalletAddress } , {   PutOnSale : false , PutOnSaleType : 'Not For Sale' } )


const activity = await Activity({
  From: "stakeaddress", 
  To: WalletAddress ,
  Activity: "withdraw",
  NFTPrice: '',
  Type:  "Not For Sale",
  CoinName: Item?.CoinName ,
  NFTQuantity: '',
  NFTBalance: '' ,
  HashValue: transcationhash ,
  NFTId: nftid ,
  NFTName: Item?.NFTName ,
  ContractType: Item?.ContractType , 
  ContractAddress: Item?.ContractAddress  ,
  CollectionNetwork: Item?.CollectionNetwork ,
  Category:  Item?.Category ,
});

sendResponse(res , 200 , update ? true : false , update ? "nft withdraw successfully" : "withdraw failed" , update)

  }catch(err){
    catchresponse(res , err)
  }
}






export const getcollectionbyslug = async (req, res) => {
  try{
    const{ slug } = req.params
    console.log("......................................")
    console.log(slug )
    const sdk = require('api')('@opensea/v2.0#hbu2zlsaz6n88');
    sdk.auth(config.OPENSEAKEY);
    sdk.server(config.OPENSEAURL);
    
   const response = await sdk.get_collection({collection_slug: slug })

   sendResponse(res , 200 , true , "fetched successfully" , response.data)

  }catch(err){
    catchresponse(res , err)


  }

}


export const Savecollectionbyslug = async (req, res) => {
  try{
    const{ slug } = req.params

    const findexist = await collectionfind({ CollectionSymbol : slug  })
    if(findexist){
    return  sendResponse(res , 200 , false , "collection already exist" , findexist )
    }




    const sdk = require('api')('@opensea/v2.0#hbu2zlsaz6n88');
    sdk.auth(config.OPENSEAKEY);

    sdk.server(config.OPENSEAURL);




   let  response = await sdk.get_collection({collection_slug: slug })
   response = response.data
  console.log("sjsjsjsjsjs" , response)

   const finename = Date.now() + ".webp";
   const filename = `public/collection/profile/${response?.collection}/${finename}`;
   const uploadimagpath = `/collection/profile/${response?.collection}/${finename}`
   const saveipfsimage = await saveIpfsData(response?.image_url , filename);
                 
   const banfilename = `public/collection/cover/${response?.collection}/${finename}`;
   const uploadbannerimagpath = `/collection/cover/${response?.collection}/${finename}`
   const saveipfsbannerimage = await saveIpfsData(response?.banner_image_url , banfilename);
                 



const payload = {
  CollectionName : response?.name,
  CollectionProfileImage : response?.image_url ? response?.image_url : "",
  CollectionCoverImage : response?.banner_image_url ? response?.banner_image_url : "",
  CollectionCreator: response?.owner ? response?.owner  : response?.contracts[0].owner  ,
  Category : response?.collection,
  CollectionSymbol : response?.collection,
  CollectionBio : response?.description,
  total_supply : response?.total_supply,
  status: response?.safelist_status ,
  opensea_url : response?.opensea_url,
  fees : response?.fees, 
  image_url  : uploadimagpath ,
  banner_url : uploadbannerimagpath ,
  CollectionNetwork : response?.contracts[0]?.chain ? response?.contracts[0]?.chain  : "ethereum"
}


const save = await SaveCollection(payload)

   return sendResponse(res , 200 , save ? true : false  , save ? "collection saved successfully" : "falied to save " , save )

  }catch(err){
    catchresponse(res , err)
  }

}

export const Collectionlist = async (req , res )=>{

try{
  const data = await collectionget()


  sendResponse(res , 200 , true , "fetched successfully" , data)
}catch(error){
  catchresponse(res , error )
}


}


export const CollectionChangeStatus= async (req , res )=>{

  try{
    const  id = req.body
    console.log("collectionfindcollectionfind",req.body)
    const data = await collectionstatus(id)
  

    sendResponse(res , 200 , true , "status changed successfully" , data)
  }catch(error){
    catchresponse(res , error )
  }
  
  
  }









export const OpenSeaLoadmoreFetchNFT = async (req , res ) => {
const { skip , limit , symbol  , contract } = req.body
const collectionDB = require('./schema/collection.schema')
console.log(req)
  try {
    const axios = require('axios')
      const sdk = require('api')('@opensea/v2.0#hbu2zlsaz6n88');
      sdk.auth('9791cc4835a24e6da4798f64dcec095b');
      // sdk.server('https://testnets-api.opensea.io');
      sdk.server('https://opensea.io');

	// const ContractAddress = config.CONTRACTADDRESS
	// const Collectioslug = config.SLUGS;
	// const ContractAddressCreator = config.Collectioncreator
// for(let i = 0 ; i < ContractAddress.length ; i++){
	const collectiondata = await collectionDB.findOne({ CollectionSymbol : symbol })
	
	const collectiondatatoken = await TokenDb.findOne({ CollectionSymbol : symbol }).sort({ createdAt: -1 }).limit(1)
	// count of nft in collection in our db 
	const Countofnft = await TokenDb.findOne({ CollectionSymbol : symbol }).count()



	let	  NFTsList
	if(collectiondatatoken.next){
		NFTsList = await sdk.list_nfts_by_collection({limit: '1', collection_slug:  symbol , next : collectiondatatoken.next })
		
	}else{
		res.status(404).json({ "status": false, "message": "next not found may be this could be fetched all the nft from opensea"})
	}

	for (let j = 0 ; j < NFTsList?.data?.nfts.length ; j++ ){
	const Item = NFTsList?.data?.nfts[j]

          let ownerofnft = ""

          const NFTFind = await TokenDb.findOne({ NFTId: Item?.identifier, Category : Item?.collection })
 
	if (!NFTFind) {
	let NFTdata = await sdk.get_nft({
	chain: 'ethereum',
	address:  collectiondatatoken.ContractAddress.toLowerCase(),
	identifier: Item?.identifier,
	});

NFTdata = NFTdata?.data

const ipfsUrl = Item?.image_url;
// const ext = Item?.image_url.split
const finename = Date.now() + ".webp";
const filename = `public/nft/${NFTdata.nft?.creator}/Compressed/${finename}`;
const uploadimagpath = `/nft/${NFTdata.nft?.creator}/Compressed/${finename}`
const saveipfsimage = await saveIpfsData(ipfsUrl, filename);
       
let transformedData  = []
           if(NFTdata?.nft?.traits){
             transformedData = NFTdata?.nft?.traits.map(item => ({ [item.trait_type]: item.value }));
           }



             const  NFT = {
                NFTId: NFTdata.nft?.identifier,
                NFTName: NFTdata.nft?.name,
                NFTDescription : NFTdata.nft?.description ? NFTdata.nft?.description : '',
                Category : NFTdata.nft?.collection, 
                CollectionName : NFTdata.nft?.collection, 
                CollectionSymbol : Item?.collection ,
                Collection: Item?.collection,
                tokenPrice: 'unlimited',
                NFTProperties :  transformedData ,
                tokenOwner: NFTdata.nft?.owners ? NFTdata.nft?.owners[0]?.address :  NFTdata.nft?.creator ,
                NFTCreator:  NFTdata.nft?.creator,
                NFTQuantity: Item?.token_standard === "erc721" ? '1' : NFTdata.nft?.owners[0]?.quantity ,
                // balance: BalanceOfTotalSupply?.balance,
                openSeaUrl : Item?.opensea_url , 
                ContractAddress: Item?.contract,
                status: true,
                ContractType : Item?.token_standard === "erc721" ? "721" : "1155",

                animation_url : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url  :'',
                NFTThumpImageIpfs : NFTdata.nft?.animation_url ? Item?.image_url : '',
                NFTOrginalImageIpfs : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url  : Item?.image_url,
                image_url : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url : uploadimagpath  , 
                image_thumb_url :  NFTdata.nft?.animation_url ? uploadimagpath : "" ,
                NFTOrginalImage : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url : NFTdata.nft?.image_url ,
                NFTThumpImage :  NFTdata.nft?.animation_url ? NFTdata.nft?.image_url : NFTdata.nft?.image_url ,
                CompressedFile :NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url : NFTdata.nft?.image_url  ,
                CompressedThumbFile : NFTdata.nft?.image_url  ,
                MetaData: Item?.metadata_url,
                RandomName : Item?.RandomName,
                NonceHash: Item?.NonceHash,
                SignatureHash: Item?.SignatureHash,
                BuyType: "ethereum",
                CollectionNetwork: "ethereum",
                Owners :   NFTdata.nft?.owners ,
                next : NFTdata.next
            };


              const  NFTOwner = {
                NFTId:  NFTdata.nft?.identifier,
                NFTName:  NFTdata.nft?.name,
                NFTOwner:  NFTdata.nft?.owners ? NFTdata.nft?.owners[0]?.address :  NFTdata.nft?.creator,
                tokenowner:   NFTdata.nft?.creator,
                  PutOnSale : false,
                  NFTPrice: '',
                  CoinName: "ethereum",
                  // deleted: OwnerCheck ? 1 : 0,
                  Category:  Item?.collection, 
                  CollectionName : Item?.collection, 
                  ContractAddress: Item?.contract,
                  NFTBalance : Item?.token_standard === "erc721" ?  '1'  : NFTdata.nft?.owners[0]?.quantity ,
                  NFTQuantity : Item?.token_standard === "erc721" ? '1' : NFTdata.nft?.owners[0]?.quantity  ,
                  NFTtype : Item?.token_standard == "erc1155" ? 1155 : 721,
                
                  BuyType: "ethereum",
                  RandomName: Item?.RandomName,
                  NonceHash: Item?.NonceHash,
                  SignatureHash: Item?.SignatureHash,
                  Platform : "OpenSea",
               
              };

            
                  const NewNFT = new TokenDb(NFT);
                   await NewNFT.save()
               
              
              const TokenOwnersFind = await TokenOwnersDb.findOne({ tokenID: Item?.identifier, Category:  Item?.collection  })
              if (!TokenOwnersFind) {
                  const NewNFTOwner = new TokenOwnersDb(NFTOwner);
                  const TokenOwnersave = await NewNFTOwner.save()
     

    await Activity({
      From: "NullAddress",
      To: Item?.token_standard === "erc721" ? ownerofnft.toLowerCase() : "0x025c1667471685c323808647299e5DbF9d6AdcC9".toLowerCase(),
      Activity: "Mint",
      NFTPrice: '',
      Type:  "Not For Sale",
      CoinName: "ethereum",
      NFTQuantity: Item?.token_standard === "erc721" ?  1  :  NFTdata.nft?.owners[0]?.quantity,
      NFTBalance:  Item?.token_standard === "erc721" ?  1  :  NFTdata.nft?.owners[0]?.quantity,
      HashValue: Item?.NonceHash ,
      NFTId: Item?.identifier,
      NFTName: Item?.name,
      ContractType: Item?.token_standard == "erc1155" ? 1155 : 721,
      ContractAddress: Item?.contract ,
      CollectionNetwork: 'ethereum',
      Category:  Item?.collection,
      SignatureHash: Item?.SignatureHash,
    });


              }
          }
     
        

      }

    



 sendResponse(res,200,true,"success");
  } catch (e) {
    console.error("Error in opeseafetch",e)

  }
};









export const OpenSeaFetchAllNFTinOneTime  = async () => {
  
  try {
    const axios = require('axios')
      const sdk = require('api')('@opensea/v2.0#hbu2zlsaz6n88');
      sdk.auth('9791cc4835a24e6da4798f64dcec095b');

      sdk.server('https://opensea.io');

const ContractAddress = config.CONTRACTADDRESS
const Collectioslug = config.SLUGS;
const ContractAddressCreator = config.Collectioncreator
for(let i = 0 ; i < ContractAddress.length ; i++){

    let  NFTsList = await sdk.list_nfts_by_collection({limit: '200', collection_slug: Collectioslug[i]})
    let next = NFTsList?.data?.next

while (next) {
console.log(Collectioslug[i])

for (let j = 0 ; j < NFTsList?.data?.nfts.length ; j++ ){
const Item = NFTsList?.data?.nfts[j]
          let ownerofnft = ""
          let BalanceOfTotalSupply =""
          const NFTFind = await TokenDb.findOne({ NFTId: Item?.identifier, Category : Item?.collection })

 
          if (!NFTFind) {
let NFTdata = await sdk.get_nft({
chain: 'ethereum',
address: ContractAddress[i].toLowerCase(),
identifier: Item?.identifier,
})

NFTdata = NFTdata?.data
const ipfsUrl = Item?.image_url;
const finename = Date.now() + ".webp";
const filename = `public/nft/${NFTdata.nft?.creator}/Compressed/${finename}`;
const uploadimagpath = `/nft/${NFTdata.nft?.creator}/Compressed/${finename}`
const saveipfsimage = await saveIpfsData(ipfsUrl, filename);
      
let transformedData  = []

           if(NFTdata?.nft?.traits){
             transformedData = NFTdata?.nft?.traits.map(item => ({ [item.trait_type]: item.value }));
           }



             const  NFT = {
                NFTId: NFTdata.nft?.identifier,
                NFTName: NFTdata.nft?.name,
                NFTDescription : NFTdata.nft?.description ? NFTdata.nft?.description : '',
                Category : NFTdata.nft?.collection, 
                CollectionName : NFTdata.nft?.collection, 
                CollectionSymbol : Item?.collection ,
                Collection: Item?.collection,
                tokenPrice: 'unlimited',
                NFTProperties :  transformedData ,
                tokenOwner: NFTdata.nft?.owners ? NFTdata.nft?.owners[0]?.address :  NFTdata.nft?.creator ,
                NFTCreator:  NFTdata.nft?.creator,
                NFTQuantity: Item?.token_standard === "erc721" ? '1' : NFTdata.nft?.owners[0]?.quantity ,
                openSeaUrl : Item?.opensea_url , 
                ContractAddress: Item?.contract,
                status: true,
                ContractType : Item?.token_standard === "erc721" ? "721" : "1155",
                animation_url : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url  :'',
                NFTThumpImageIpfs : NFTdata.nft?.animation_url ? Item?.image_url : '',
                NFTOrginalImageIpfs : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url  : Item?.image_url,
                image_url : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url : uploadimagpath  , 
                image_thumb_url :  NFTdata.nft?.animation_url ? uploadimagpath : "" ,
                NFTOrginalImage : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url : NFTdata.nft?.image_url ,
                NFTThumpImage :  NFTdata.nft?.animation_url ? NFTdata.nft?.image_url : NFTdata.nft?.image_url ,
                CompressedFile :NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url : NFTdata.nft?.image_url  ,
                CompressedThumbFile : NFTdata.nft?.image_url  ,
                MetaData: Item?.metadata_url,
                RandomName : Item?.RandomName,
                NonceHash: Item?.NonceHash,
                SignatureHash: Item?.SignatureHash,
                BuyType: "ethereum",
                CollectionNetwork: "ethereum",
                Owners :   NFTdata.nft?.owners ,
            };


              const  NFTOwner = {
                NFTId:  NFTdata.nft?.identifier,
                NFTName:  NFTdata.nft?.name,
                NFTOwner:  NFTdata.nft?.owners ? NFTdata.nft?.owners[0]?.address :  NFTdata.nft?.creator,
                tokenowner:   NFTdata.nft?.creator,
                  PutOnSale : false,
                  NFTPrice: '',
                  CoinName: "ethereum",
                  // deleted: OwnerCheck ? 1 : 0,
                  Category:  Item?.collection, 
                  CollectionName : Item?.collection, 
                  ContractAddress: Item?.contract,
                  NFTBalance : Item?.token_standard === "erc721" ?  '1'  : NFTdata.nft?.owners[0]?.quantity ,
                  NFTQuantity : Item?.token_standard === "erc721" ? '1' : NFTdata.nft?.owners[0]?.quantity  ,
                  NFTtype : Item?.token_standard == "erc1155" ? 1155 : 721,
                
                  BuyType: "ethereum",
                  RandomName: Item?.RandomName,
                  NonceHash: Item?.NonceHash,
                  SignatureHash: Item?.SignatureHash,
                  Platform : "OpenSea",
               
              };

            
                  const NewNFT = new TokenDb(NFT);
                   await NewNFT.save()
               
              
              const TokenOwnersFind = await TokenOwnersDb.findOne({ tokenID: Item?.identifier, Category:  Item?.collection  })
              if (!TokenOwnersFind) {
                  const NewNFTOwner = new TokenOwnersDb(NFTOwner);
                  const TokenOwnersave = await NewNFTOwner.save()
     

    await Activity({
      From: "NullAddress",
      To: Item?.token_standard === "erc721" ? ownerofnft.toLowerCase() : "0x025c1667471685c323808647299e5DbF9d6AdcC9".toLowerCase(),
      Activity: "Mint",
      NFTPrice: '',
      Type:  "Not For Sale",
      CoinName: "ethereum",
      NFTQuantity: Item?.token_standard === "erc721" ?  1  :  NFTdata.nft?.owners[0]?.quantity,
      NFTBalance:  Item?.token_standard === "erc721" ?  1  :  NFTdata.nft?.owners[0]?.quantity,
      HashValue: Item?.NonceHash ,
      NFTId: Item?.identifier,
      NFTName: Item?.name,
      ContractType: Item?.token_standard == "erc1155" ? 1155 : 721,
      ContractAddress: Item?.contract ,
      CollectionNetwork: 'ethereum',
      Category:  Item?.collection,
      SignatureHash: Item?.SignatureHash,
    });


              }
          }
     
        

      }

        NFTsList = await sdk.list_nfts_by_collection({limit: '50', collection_slug: Collectioslug[i] , next : next })
        next = NFTsList?.data?.next
    }

    

}

 
  } catch (e) {
    console.error("Error in opeseafetch",e)
    // const FindNFTsDet = await TokenOwnersDb.find({ deleted: 1, quantity: { $gt: 0 } })
    OpenSeaFetchNFT()
  }
};


// export const OpenSeaFetchNFTwithcontract = async () => {
//   // console.log("req", req.?body);
//   try {
//     const axios = require('axios')
//       const sdk = require('api')('@opensea/v2.0#hbu2zlsaz6n88');
//       // sdk.auth('c364a24fb2ee4ab6b72df0f8312517f9');
//       sdk.auth('9791cc4835a24e6da4798f64dcec095b');
//       sdk.server('https://testnets-api.opensea.io');
//       // sdk.server('https://opensea.io');

// const ContractAddress = config.CONTRACTADDRESS
// const Collectioslug = ['galficollection721'];
// const ContractAddressCreator = config.Collectioncreator
// for(let i = 0 ; i < ContractAddress.length ; i++){

//       console.log(Collectioslug[i])
//       const  NFTsList = await sdk.list_nfts_by_collection({limit: '1', collection_slug: Collectioslug[i]})
//       console.log(NFTsList)

// for (let j = 0 ; j < NFTsList?.data?.nfts.length ; j++ ){
// const Item = NFTsList?.data?.nfts[j]

//           var SendData = {
//               NFTConAddress: Item?.contract,
//               OwnerAddress: ContractAddressCreator[i].toLowerCase(),
//               NFTId: Item?.identifier,
//               Data: [ContractAddressCreator[i].toLowerCase(), Item?.identifier]
//           }

//           let ownerofnft = ""
//           let BalanceOfTotalSupply =""

//             if( Item?.token_standard === "erc721"){
//               //  ownerofnft = await getOwnerOf721Token(Item?.contract , Item?.identifier )
//             }else{
//               //  BalanceOfTotalSupply = await BalanceOfOpenSeaNfts(SendData)
//             }
      
//           // console.log("BalanceOfTotalSupply", BalanceOfTotalSupply);
//           // var BalanceOfTotalSupply = "dummy"
//           // const NFTFind = await TokenDb.findOne({ NFTId: Item?.identifier, NFTCreator: "0x025c1667471685c323808647299e5DbF9d6AdcC9".toLowerCase() })
//           const NFTFind = await TokenDb.findOne({ NFTId: Item?.identifier, Category : Item?.collection })

//           // console.log("NFTFindNFTFind", NFTFind);
 
//           if (!NFTFind) {
//               const OwnerCheck = "0x025c1667471685c323808647299e5DbF9d6AdcC9".toLowerCase() === "0x025c1667471685c323808647299e5DbF9d6AdcC9".toLowerCase()
             
        
            


// let NFTdata = await sdk.get_nft({
// chain: 'ethereum',
// address: ContractAddress[i].toLowerCase(),
// identifier: Item?.identifier,
// })
// NFTdata = NFTdata?.data

// const ipfsUrl = Item?.image_url;
// // const ext = Item?.image_url.split
// const finename = Date.now() + ".webp";
// const filename = `public/nft/${NFTdata.nft?.creator}/Compressed/${finename}`;
// const uploadimagpath = `/nft/${NFTdata.nft?.creator}/Compressed/${finename}`
// const saveipfsimage = await saveIpfsData(ipfsUrl, filename);
//            console.log( NFTdata?.nft?.traits) 
// let transformedData  = []
//            if(NFTdata?.nft?.traits){
//              transformedData = NFTdata?.nft?.traits.map(item => ({ [item.trait_type]: item.value }));
//            }


// console.log(transformedData);
//              const  NFT = {
//                 NFTId: NFTdata.nft?.identifier,
//                 NFTName: NFTdata.nft?.name,
//                 NFTDescription : NFTdata.nft?.description ? NFTdata.nft?.description : '',
//                 Category : NFTdata.nft?.collection, 
//                 CollectionName : NFTdata.nft?.collection, 
//                 CollectionSymbol : Item?.collection ,
//                 Collection: Item?.collection,
//                 tokenPrice: 'unlimited',
//                 NFTProperties :  transformedData ,
//                 tokenOwner: NFTdata.nft?.owners ? NFTdata.nft?.owners[0]?.address :  NFTdata.nft?.creator ,
//                 NFTCreator:  NFTdata.nft?.creator,
//                 NFTQuantity: Item?.token_standard === "erc721" ? '1' : NFTdata.nft?.owners[0]?.quantity ,
//                 // balance: BalanceOfTotalSupply?.balance,
//                 openSeaUrl : Item?.opensea_url , 
//                 ContractAddress: Item?.contract,
//                 status: true,
//                 ContractType : Item?.token_standard === "erc721" ? "721" : "1155",

//                 animation_url : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url  :'',
//                 NFTThumpImageIpfs : NFTdata.nft?.animation_url ? Item?.image_url : '',
//                 NFTOrginalImageIpfs : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url  : Item?.image_url,
//                 image_url : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url : uploadimagpath  , 
//                 image_thumb_url :  NFTdata.nft?.animation_url ? uploadimagpath : "" ,
//                 NFTOrginalImage : NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url : NFTdata.nft?.image_url ,
//                 NFTThumpImage :  NFTdata.nft?.animation_url ? NFTdata.nft?.image_url : NFTdata.nft?.image_url ,
//                 CompressedFile :NFTdata.nft?.animation_url ? NFTdata.nft?.animation_url : NFTdata.nft?.image_url  ,
//                 CompressedThumbFile : NFTdata.nft?.image_url  ,
//                 MetaData: Item?.metadata_url,
//                 RandomName : Item?.RandomName,
//                 NonceHash: Item?.NonceHash,
//                 SignatureHash: Item?.SignatureHash,
//                 BuyType: "ethereum",
//                 CollectionNetwork: "ethereum",
//                 Owners :   NFTdata.nft?.owners ,
//                 next : NFTsList.data?.next ? NFTsList.data?.next : null
//             };


//               const  NFTOwner = {
//                 NFTId:  NFTdata.nft?.identifier,
//                 NFTName:  NFTdata.nft?.name,
//                 NFTOwner:  NFTdata.nft?.owners ? NFTdata.nft?.owners[0]?.address :  NFTdata.nft?.creator,
//                 tokenowner:   NFTdata.nft?.creator,
//                   PutOnSale : false,
//                   NFTPrice: '',
//                   CoinName: "ethereum",
//                   // deleted: OwnerCheck ? 1 : 0,
//                   Category:  Item?.collection, 
//                   CollectionName : Item?.collection, 
//                   ContractAddress: Item?.contract,
//                   NFTBalance : Item?.token_standard === "erc721" ?  '1'  : NFTdata.nft?.owners[0]?.quantity ,
//                   NFTQuantity : Item?.token_standard === "erc721" ? '1' : NFTdata.nft?.owners[0]?.quantity  ,
//                   NFTtype : Item?.token_standard == "erc1155" ? 1155 : 721,
                
//                   BuyType: "ethereum",
//                   RandomName: Item?.RandomName,
//                   NonceHash: Item?.NonceHash,
//                   SignatureHash: Item?.SignatureHash,
//                   Platform : "OpenSea",
               
//               };

            
//                   const NewNFT = new TokenDb(NFT);
//                    await NewNFT.save()
               
              
//               const TokenOwnersFind = await TokenOwnersDb.findOne({ tokenID: Item?.identifier, Category:  Item?.collection  })
//               if (!TokenOwnersFind) {
//                   const NewNFTOwner = new TokenOwnersDb(NFTOwner);
//                   const TokenOwnersave = await NewNFTOwner.save()
     

//     await Activity({
//       From: "NullAddress",
//       To: Item?.token_standard === "erc721" ? ownerofnft.toLowerCase() : "0x025c1667471685c323808647299e5DbF9d6AdcC9".toLowerCase(),
//       Activity: "Mint",
//       NFTPrice: '',
//       Type:  "Not For Sale",
//       CoinName: "ethereum",
//       NFTQuantity: Item?.token_standard === "erc721" ?  1  :  NFTdata.nft?.owners[0]?.quantity,
//       NFTBalance:  Item?.token_standard === "erc721" ?  1  :  NFTdata.nft?.owners[0]?.quantity,
//       HashValue: Item?.NonceHash ,
//       NFTId: Item?.identifier,
//       NFTName: Item?.name,
//       ContractType: Item?.token_standard == "erc1155" ? 1155 : 721,
//       ContractAddress: Item?.contract ,
//       CollectionNetwork: 'ethereum',
//       Category:  Item?.collection,
//       SignatureHash: Item?.SignatureHash,
//     });


//               }
//           }
     
        

//       }

    

// }

 
//   } catch (e) {
//     console.error("Error in opeseafetch",e)
//     // const FindNFTsDet = await TokenOwnersDb.find({ deleted: 1, quantity: { $gt: 0 } })
//     OpenSeaFetchNFT()
//   }
// };
