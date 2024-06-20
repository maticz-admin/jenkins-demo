import { model , Schema} from 'mongoose'

const collection = new Schema({
    CollectionName: {
        type: String,
        default: '',
    },CollectionProfileImage: {
        type: String,
        default: '',
    },
    image_url: {
        type: String,
        default: '',
    },
    banner_url: {
        type: String,
        default: '',
    },
    opensea_url: {
        type: String,
        default: '',
    },
    total_supply: {
        type: String,
        default: '',
    },
    CollectionCoverImage: {
        type: String,
        default: '',
    },CollectionSymbol: {
        type: String,
        default: '',
    },CollectionBio: {
        type: String,
        default: '',
    },CollectionType: {
        type: String,
        default: '',
    },CollectionNetwork: {
        type: String,
        default: '',
    },CollectionCreator: {
        type: String,
        default: '',
    }
    ,Category: {
        type: String,
        default: '',
    },CollectionContractAddress: {
        type: String,
        default: '',
    },
    status : {
        type: String,
        default: 'false',
    },
    fees : [],
    Approved: {
        type: Boolean,
        default: true,
    },
    isActive: {
        type: Boolean,
        default: true, 
    }
    
},{timestamps:true,timeseries:true})

module.exports = model('collection',collection)