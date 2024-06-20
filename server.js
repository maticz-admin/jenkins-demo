import mongoose from 'mongoose';
import express from 'express'
import path from 'path';
import fileupload from 'express-fileupload';
import cors from 'cors'
import config from './config/config';
import cookieParser from 'cookie-parser'
import compression from 'compression';
import morgan from "morgan";
import { Decryptdata, bcyptPass } from './shared/credentialsetup';
import { isEmpty, saveIpfsData } from './shared/commonFunction';
import helmet from 'helmet';
import routers from './router/routes';
import cryptoprice from "./app/nft/schema/cryptoprice.schema"
import cron from 'node-cron';
import { OpenSeaFetchAllNFTinOneTime, OpenSeaFetchNFT } from './app/nft/nft.controlller';
import { createCurrencyforuser } from './app/user/user.controller';
const axios = require('axios')

// moongose.strictPopulate
const mongodbConnect= async (MONGODBURL)=>{

  try {
        mongoose.connect(MONGODBURL);
        console.log("mongodb connected " , MONGODBURL )
    } catch (error) {
      console.error("mongoose error",error);
    }
}
mongodbConnect(config.MONGOURI)
const cacheTime = 86400000 * 3
const app = express()
app.use((req, res, next) => {

  
    express.json()(req, res, next);  // ONLY do express.json() if the received request is NOT a WebHook from Stripe.
  
})
app.use(express.urlencoded({
  extended: false
}))
app.use(cors())
app.use(fileupload())
app.use('/', express.static(path.join(__dirname, 'public'), {
  maxAge: cacheTime
}))

// using Helmet along with your custom headers, you can enhance the security of your Node.js application.
app.use(helmet());

app.use((req, res, next) => {
  
          //orgin verify
          const whitelist = [config.SITE_URL,"https://galfifront.maticz.in","http://galfi_dev.maticz.in","http://localhost:3001","https://galfiadmin.maticz.in",'https://galfiadmin.maticz.in/',"http://localhost:3003","http://localhost:3004","http://localhost:3000","http://localhost:3002" ,"http://192.168.29.59:3000",undefined ]
          const origin = req.get('origin');
          console.log('kdhsfksffs',origin)
          // if (whitelist.indexOf(origin) !== -1) {
            if (true) {
            console.log('orginaccepted',origin)
          cookieParser()
          compression()
          // fileupload()
            res.header('Access-Control-Allow-Origin', '*');  
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.header('Access-Control-Allow-Credentials', true);-
            res.setHeader('Last-Modified', (new Date()).toUTCString());
            res.header('no-referrer-when-downgrade', '*');
            res.header('no-referrer', '*');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            cookieParser()
            compression()
           next();
          } else {
            return res.status(500).json({ "status": false, "message": "Origin Failed"})
          }
        
      
   
  
});




 morgan.token('body', (req,res,next) => {
    return JSON.stringify((req,res,next))
  })
  morgan.token('query', (req,res,next) => {
    return JSON.stringify((req,res,next))
  })
  morgan.token('param', (req,res,next) => {
    return JSON.stringify((req,res,next))
  })
  app.use(morgan(':method :url :body   :res[content-length] - :response-time ms'));
  app.get('/',(req,res)=>{res.send(
        `<a href={${config.FRONT_URL}}>Click To redirect galfi galaxy  Home</a>`
    )})


  


app.use('/v1',routers)

async function createsalt (){
  let kk = await  bcyptPass("SuperAdmin@123")
console.log(kk)
}
// createsalt()


app.listen(config.PORT,()=>{
  console.log("Server Connected to the port",config.PORT)
}).on('error', (e) => {
  console.error("Server listen to the port",e)  
}) 


   // Your code to fetch BNB and MATIC prices from the API goes here
const updateCryptoPrices = async () => {
  try {
   
    
      const response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=BNB&tsyms=USD`);
     
      const bnbPriceUSD = response.data.USD
      const responsematic = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=MATIC&tsyms=USD`);
      const maticPriceUSD = responsematic.data.USD
     
      // Update the schema with the fetched prices
      // await cryptoprice.create({
      //     bnbPriceUSD,
      //     maticPriceUSD,
      //     source: 'cryptocompare' // Replace with your actual data source
      // });

      await cryptoprice.findByIdAndUpdate("663358c2b1c587063b18bcd4" , { bnbPriceUSD, maticPriceUSD })

      console.log('Crypto prices updated successfully:', { bnbPriceUSD, maticPriceUSD });
  } catch (error) {
      console.error('Error updating crypto prices:', error);
  }
};

// OpenSeaFetchNFT()

// OpenSeaFetchAllNFTinOneTime()
cron.schedule('0 */6 * * *', () => {
  updateCryptoPrices();
});
// updateCryptoPrices();


// OpenSeaFetchNFT
// createCurrencyforuser("0x025c1667471685c323808647299e5DbF9d6AdcC9" , "66572b78d6974b5f07e90c0c")