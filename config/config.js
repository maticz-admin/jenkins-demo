import dotenv from 'dotenv'
import ERC20 from "./ABI/erc20.json" 
import Web3 from 'web3';
dotenv.config({path:`./env/.env.${process.env.NODE_ENV}`})

const EnvName             =    process.env.NODE_ENV;
const colletionslugs = [
    'galacticapesgenesis',   
    'galacticapes', 
    'galacticmonkes',
    'starwolves',
    'starwolvez-generative',
    'dystopunks',
    'dystopunks-v1',
    'leg1on',
    'space-yetis-official',
    'mutantkongz',
    'gorillanemesis',
    'forgottenruneswizardscult',
    'save-the-martians',
    'degenasaurs',
    'neotokyo-citizens'  
   ];
  const colletioncontractaddress = [
    '0x495f947276749ce646f68ac8c248420045cb7b5e',
    '0x12d2d1bed91c24f878f37e66bd829ce7197e4d14',
    '0x7bb6413c939d9ecc62bdd60d6e23816b1ae9099f',
    '0x7ceb53ffca6d2919f4ccd789f2f164eda811d85d',
    '0xd098C59D5d4A1aC3909f6093D0cf565314eCD240',
    '0xbea8123277142de42571f1fac045225a1d347977',
    '0x495f947276749ce646f68ac8c248420045cb7b5e',
    '0xa2b63e4c1ea4f494f6d63ac1c5a673c5bcc43b6c',
    '0x33a39af0f83e9d46a055e6eebde3296d26d916f4',
    '0x495f947276749ce646f68ac8c248420045cb7b5e',
    '0x984eea281bf65638ac6ed30c4ff7977ea7fe0433',
    '0x521f9c7505005cfa19a8e5786a9c3c9c9f5e6f42',
    '0x4961db588dd962abb20927aa38fa33e5225b3be2',
    '0x495f947276749ce646f68ac8c248420045cb7b5e',
    '0xb9951b43802dcf3ef5b14567cb17adf367ed1c0f'  
  ];
  const colletioncontractaddresscreator = [
    '0x5b3256965e7C3cF26E11FCAf296DfC8807C01073',
    '0x12aDf1D49a025051943Ac97C1D49BF0Df9e739FE',
    '0x4ea9306dE38998aB80305efD26aDD9Bb9DB5755C',
    '0x330Fc1a30f3de74ecAC9A15b7EC170D1E4CFE876',
    '0x330Fc1a30f3de74ecAC9A15b7EC170D1E4CFE876',
    '0xb9B6856eFD128294a912D584366448BC3d4Ea979',
    '0x5b3256965e7C3cF26E11FCAf296DfC8807C01073',
    '0xb9B6856eFD128294a912D584366448BC3d4Ea979',
    '0x9804D8050BEA13a2C47D8a72458Ce70a24b9Ee11',
    '0x5b3256965e7C3cF26E11FCAf296DfC8807C01073',
    '0x227483a4Ee6f178DC7aCF8998bdB7D2548416F4F',
    '0xD584fE736E5aad97C437c579e884d15B17A54a51',
    '0xB75521560E1E68A1297bCfAcD0252E4b52711b66',
    '0x5b3256965e7C3cF26E11FCAf296DfC8807C01073',
    '0xa8dA6166cbD2876cCde424eE2a717C355bE4702B' 
  ];

//   https://opensea.io
const Key   =   {
    CONTRACTADDRESS : colletioncontractaddress ,
    SLUGS : colletionslugs, 
    Collectioncreator : colletioncontractaddresscreator , 
OPENSEAKEY : '9791cc4835a24e6da4798f64dcec095b',
    // OPENSEANETWORK : 'ethereum',
    // OPENSEAURL  : 'https://opensea.io',
    // CHAIN : 'ethereum',
    CHAIN : 'sepolia',
    OPENSEAURL : 'https://testnets-api.opensea.io',
    OPENSEANETWORK : 'sepolia',
    NFT_Token : ERC20  , 
    FRONT_URL       :   process.env.FRONT_URL,
    PORT            :   process.env.PORT,
    MONGOURI        :   process.env.MONGOURI,
    SECRET_KEY      :   process.env.SECRET_KEY,
    Encrypt_key     :   process.env.Decryptkey,
    TWILLO_AUTH     :   process.env.TWILLO_AUTH,
    TWILLO_SID     :   process.env.TWILLO_SID,
    TWILLO_VERIFY_SID     :   process.env.TWILLO_VERIFY_SID,
    ethRpc : "https://sepolia.infura.io/v3/",
    matRpc : process.env.matRpc,
    Web3_eth : new Web3("https://sepolia.infura.io/v3/"),
    Web3_mat : new Web3(process.env.matRpc),
    ipgeo           :   process.env.ipgeo,
    ImgUrl          :   process.env.ImgUrl,
    adminmail       :   process.env.adminmail,
    keyEnvBased     :   {
            emailGateway: {
            
                fromMail: process.env.user,
                nodemailer: {
                    host: "smtp.zeptomail.com",
                    port:  465,
                    secure: true,
                    auth: {
                        // type: 'OAuth2',
                        // user: process.env.user,
                        //  clientId: process.env.CLIENT_ID,
                        //  clientSecret: process.env.CLEINT_SECRET,
                        //  refreshToken: process.env.REFRESH_TOKEN,
                        user: process.env.user,
                        pass: process.env.pass
                        //  accessToken: accestok(),
                    }
                }
        }     
    }
}

//   oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
  
        
//     
    


export default Key;