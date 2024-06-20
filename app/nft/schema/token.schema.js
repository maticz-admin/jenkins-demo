import { Schema, model } from 'mongoose'

const token = new Schema({
    NFTId: { type: String, default: '' },
    NFTName: { type: String, default: '' },
    Category: { type: String, default: '' },
    status: { type: Boolean, default: true },
    NFTOrginalImage: { type: String, default: '' },
    image_url : { type: String, default: '' },
    image_thumb_url : { type: String, default: '' },
    NFTThumpImage: { type: String, default: '' },
    NFTOrginalImageIpfs: { type: String, default: '' },
    NFTThumpImageIpfs: { type: String, default: '' },
    openSeaUrl: { type: String, default: '' },
    MetaData: { type: String, default: '' },
    CompressedFile: { type: String, default: '' },
    CompressedThumbFile: { type: String, default: '' },
    UnlockContent: { type: String, default: '' },
    ContractAddress: { type: String, default: '' },
    ContractType: { type: String, default: '' },
    ContractName: { type: String, default: '' },
    CollectionNetwork: { type: String, default: '' },
    CollectionName :{ type: String, default: ''},
    NFTRoyalty: { type: String, default: '' },
    NFTProperties: { type: Array, default: [] },
    NFTCreator: { type: String, default: '' },
    HideShow: { type: String, default: '' },
    NFTQuantity: { type: String, default: '' },
    BuyType :  { type: String, default: '' }, 
    reported: { type: Boolean, default: false },
    NFTDescription: { type: String, default: '' },
    isMessageapprove: { type: String, default: 'false' },
    isPricenotification: { type: String, default: 'false' },
    isPromotion: { type: String, default: 'false' },
    islegalalert: { type: String, default: 'false' },
    deleted: { type: Number, default: 1 },
    Owners :  { type: Array, default: [] },
    NFTOwnerDetails: [{
        type: Schema.Types.ObjectId,
        ref: 'tokenowner'
    }],
    likecount: { type: Number, default: 0 },
    viewcount: { type: Number, default: 0 },

    ReportBy: [{
        Address: { type: String, default: '' },
        CustomUrl: { type: String, default: '' },
        Message: { type: String, default: '' }
    }],
    CollectionSymbol: { type: String, default: '' },

    RandomName: { type: String, default: '' },
    NonceHash: { type: String, default: '' },
    SignatureHash: { type: String, default: '' },
    next : { type: String, default: '' },
}, { timestamps: true })

module.exports = model('token', token)