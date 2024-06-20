

import nodemailer from "nodemailer";
import fs from 'fs'
import config from "../config/config"
import { Encryptdata } from "./credentialsetup";
const axios = require('axios');
const sharp = require('sharp');
const util = require("util");
const path = require('path');
// import {}
// import EmailTemplates from '../app/admin/schema/emailtemplate';

// import { Find, FindOne } from "./mongoosehelper";

export const  add_minutes = function (dt, minutes) {
  return new Date(dt.getTime() + minutes*60000);
}


const makeDir = util.promisify(fs.mkdir)

export const isEmpty = (value) => {
  return (value === undefined ||
    value == 'undefined' ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0) ||
    (typeof value === "string" && value === "0") ||
    (typeof value === "number" && value === 0))
}

export const Node_Mailer = async ({ type, EmailId, subject, OTP, content, click, promo, QrCode, msg, bcc }) => {
  console.log("EmailId", EmailId)
  try {
    var content = '';
    if (isEmpty(msg)) {
      let data = {
        DBName: EmailTemplates,
        FinData: { type: type, status: false },
        SelData: { _id: 0, type: 1, content: 1, subject: 1 },
      };
      let List = await FindOne(data);
      if (List?.data?.content) {
        content = List?.data?.content;
      };
      if (!isEmpty(List?.data?.subject)) {
        subject = List?.data?.subject;
      }
    }
    if (type == "Email-change") {
      content = (msg).toString().replace(/==otp==/g, OTP);
    }
    // else if (type == "mint"||type == "transfer_drop"||type == "putonsale"||type == "cancelorder"||type == "lower"||type == "buy_owner"||type == "sell_owner"||type == "accept"||type == "edit_bid"||type == "cancel_bid"||type == "bid"){
    //   var content = (List?.msg?.content).toString().replace('http://a', click);
    // }
    // else if (type == "promo"){
    //   var content = (List?.msg?.content).toString().replace('http://a', click).replace('000000',promo)
    //   }
    // else var content = List?.msg?.content

    let smtp = nodemailer.createTransport(
      config.keyEnvBased.emailGateway.nodemailer
    );
    console.log('skdjsjfklsjkfks', bcc, content)
    if (!isEmpty(bcc)) {
      let info = await smtp.sendMail({
        from: config.keyEnvBased.emailGateway.fromMail, // sender address
        // to:   bcc.split(',')[0],
        bcc: bcc, // list of receivers
        subject: subject, // subject line
        html: content ? content : msg, // html body
      });
      console.log('sljfjsjkhfskf', info)
    }
    else {
      let info = await smtp.sendMail({
        from: config.keyEnvBased.emailGateway.fromMail, // sender address
        to: EmailId, // list of receivers
        subject: subject, // subject line
        html: content ? content : msg, // html body
      });
    }


    return true;
  } catch (E) {

    console.log('Node_Mailer error', E)
    return false;
  }
};

// export const ImageAddFunc = async (send_file) => {
//   try {

//     const  newSend = await Promise.all(
//       send_file.map(async (item) => {

//         await makeDir(item.path, { recursive: true })
//         await item.files?.mv(item.path + item.filename)
//         return item.filename;
//       })
//     );
 
//     return newSend.pop();
//   }
//   catch (e) {
//     return false
//   }
// };


export const OTP_Function = () => Math.floor(100000 + Math.random() * 900000)


export const mailsubject = {
  'Email-change': 'Verify your email address'
}

export const mailcontent = {
  'Email-change': "To verify your email address, please use the following One Time Password (OTP):\n ==otp== \n Do not share this OTP with anyone. delpick takes your account security very seriously. delpick Customer Service will never ask you to disclose or verify your delpick password, OTP, credit card, or banking account number. If you receive a suspicious email with a link to update your account information, do not click on the link—instead, report the email to delpick for investigation.\n Thank you!"
}

export const CurrentTime = () => {
  return `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
}


export const Parsingfunc = (data) => {
  try{
    data = JSON.parse(data);
    return data
  }
  catch(err){
    return data
  }
}



export const NumberChange = (data) => {
  try{
    return (isNaN(Number(data)) ? 0 : Number(data))
  }
  catch(err){
    console.log('NumberChange_error',err)
    return 0;
  }
}

export function sendResponse(res, statuscode, status, message , data = null) {
  const response = {
    status: status,
    message: message
  };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statuscode).json(Encryptdata(response));
  // return res.status(statuscode).json(response);
}

// without encrption
export function sendRes(res, statuscode, status, message , data = null) {
  const response = {
    statusCode : statuscode , 
    status: status,
    message: message
  };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statuscode).json(response);
  // return res.status(statuscode).json(response);
}

export function catchresponse (res , message ){
  console.error(message)
  return  res.status(500).json({ status: false ,  message: message.message })
}


export const compress_file_upload = async (compress_file) => {
  let retdata;
  if (compress_file) {
 await Promise.all(
      compress_file.map(async (item) => {
        const { data, name, mimetype } = item.files;
        await fs.promises.mkdir(item.path, { recursive: true })
          if (String(mimetype).includes("image")) {
            sharp(data, { animated: true })
              .webp({ quality: 80 })
              .toFile(item.path + item.filename)
              .then(() => {
                return true;
              })
              .catch((e) => {
                return false;
              });
            retdata= item.filename;
          }
          if ( String(mimetype).includes("audio") ||  String(mimetype).includes("video")  ) {
              await ffmpeg(item.fie_path)
              .setStartTime("00:00:01")
              .setDuration(10)
              .output(item.path + item.filename)
              .on("end", function (err) {
                if (!err) {
                  return true;
                }
              })
              .on("error", function (err) {
                return false;
              })
              .run();
            retdata = item.filename;
          }
       
        retdata = item.filename;
      })
    );
    return retdata;
  }
};


export const ImageAddFunc = async (
  send_file,
  type,
  ProfileUrl,
  Id,
  Creator,
  alldata,
  types,names,
  TokenName,
  CollectionNetwork,CollectionUrl
) => {
 var data;
  var newSend = await Promise.all(
    send_file.map(async (item) => {

      var nftimg = await fs.promises.mkdir(item.path, { recursive: true })
var tokenname = await item.files.mv(item.path + item.filename)

      if(types?.toString().includes('airdrop')){
      var promos =await Promise.all([...Array(Number(alldata.Quantity))].map(async(item)=>{
        var code=GenerateCOde(names)

        return {
          Code    : code,
          // QrCode  :  await QrCode(`${Config.SITE_URL}/info/drop/${CollectionNetwork}/${CollectionUrl}/${Creator}/${Id}/${Buffer.from(code).toString('base64')}`),
          Email   : '',
          Status  : 'generated',
        }
      }))
    }
     data =type!== "bulk"
        ? item.filename
        : {
            file: item.filename,
            TokenId: Id,
            Id: Id,
            TokenName: TokenName ? TokenName : Id,
            ProfileUrl: ProfileUrl,
            status: "drop",
            tx: "",
            Description: "",
            ArtistAddress: alldata.ArtistAddress,
            ArtistUrl: alldata.ArtistUrl,
            TokenPrice: alldata.CollectionPrice,
            TokenOwner: Creator,
            Quantity: alldata.Quantity,
            Balance: alldata.Quantity,
            promo : promos ?? [],
            expiry : null
          };
    })
  );
  return data;
};



export const ipfs_add = async (data) => {
  try
  {
    const { item, path } = data;
    const upload = await storage.upload(fs.readFileSync(path));
    console.log(`Gateway URL - ${storage.resolveScheme(upload)}`);
    let imgurl = storage.resolveScheme(upload)
    console.log("dfvdfvdfbdfbdfb",`${imgurl.split("/")[imgurl.split("/").length-2]}/${imgurl.split("/")[imgurl.split("/").length-1]}`);
    return  `${imgurl.split("/")[imgurl.split("/").length-2]}/${imgurl.split("/")[imgurl.split("/").length-1]}`

 }
   catch(err)
   {
    console.error("ipfs_add",err);

    // ! commented this for call stack exceed 
     //   return ipfs_add(data)

   } 
};


export const glbipfs_add = async (data) => {
  try {
    const upload = await storage.upload(fs.readFileSync(data));
    let imgurl = storage.resolveScheme(upload)
    return  `${imgurl.split("/")[imgurl.split("/").length-2]}/${imgurl.split("/")[imgurl.split("/").length-1]}`;
  }catch(err){
     console.error("glbipfs_add",err);
   } 
};









export   const  saveIpfsData =  async(url, destinationPath)=> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    if (response.status === 200) {
        // Resize and convert the image to WebP format
        const resizedImageBuffer = await sharp(response.data)
            // .resize({ width: maxWidth })
            .webp({ quality: 80 })
            .toBuffer();



        // Specify the full path including the directory structure
       const directory = path.dirname(destinationPath);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }

            // Save the resized image to the specified path
            fs.writeFileSync(destinationPath, resizedImageBuffer);
            console.log("Data saved successfully as", destinationPath);



    } else {
        console.error("Failed to fetch data from the IPFS URL");
    }
} catch (error) {
    console.error("An error occurred:", error.message);
}
}