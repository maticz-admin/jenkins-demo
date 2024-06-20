import Web3 from "web3";
import erc20 from "../config/ABI/erc20.json";
import config from "../config/config"

const ReadContract_creation = async (...data) => {
    const web3p = new Web3(config.ethRpc);

    if (web3p) {
        var contract_value = await new web3p(
            ...data
        );
   

        return contract_value;
    }
}

export const Token_Balance_Calculation = async (token_Address, data) => {
    try{
        console.log('adddrreeeessss', token_Address, data)
        const httpProvider = new Web3.providers.HttpProvider("https://1rpc.io/sepolia");
            const web3 = new Web3(httpProvider);
     const ConnectContract = await new web3.eth.Contract(erc20 , token_Address);
     console.log(".................>" + JSON.stringify(ConnectContract , null , 2))
     
                 // const ConnectContract = await ReadContract_creation(erc20, token_Address)
                 var bidAMt = await ConnectContract.methods.balanceOf(data).call();
     console.log("bidAMtbidAMt" ,bidAMt )
                 return Number(Web3.utils.fromWei(String(bidAMt)))
    }catch(err){
console.error("ERRRRR", err)    }

}

