import { Schema, model } from 'mongoose'

const stake = new Schema({
    NFTId: { type: String, default: '', ref: "token" },
    walletAddress: { type: String, default: '' },
    poolId: { type: Number },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    totalStakeDays: { type: String, default: '' },
    lastRewardDay: { type: Date, default: null },
    lastReward: { type: String, default: '' },
    Season: { type: String, default: '' },
    transcationhash : { type: String, default: '' }, 
    withdraw: { type: Boolean, default: false },
    // projectId: { type: String, default: '', ref: "project" },
}, { timestamps: true })

module.exports = model('stake', stake)