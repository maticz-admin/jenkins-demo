import { model, Schema } from "mongoose";

const activity = Schema(
    {
        From: { type: String, default: "" },
        To: { type: String, default: "" },
        Activity: { type: String, default: "" },
        NFTPrice: { type: Number, default: "" },
        CoinName: { type: String, default: "" },
        NFTQuantity: { type: String, default: "" },
        HashValue: { type: String, default: "" },
        Type: { type: String, default: "" },
        NFTId: { type: String, default: "" },
        NFTName: { type: String, default: '' },
        Category: { type: String, default: "" },
        ContractType: { type: String, default: "" },
        ContractAddress: { type: String, default: "" },
        CollectionNetwork: { type: String, default: "" },
        CollectionSymbol: { type: String, default: "" },
        SignatureHash : { type: String, default: "" },
        
    },
    { timestamps: true }
);

module.exports = model('activity',activity)