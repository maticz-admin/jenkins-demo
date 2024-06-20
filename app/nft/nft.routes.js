import { Router } from 'express';
import * as nftCtrl from './nft.controlller';
import { DecryptDatas, verifyToken } from '../../shared/credentialsetup';
const nftrouters = Router();

nftrouters.route('/validatetokenname').post(verifyToken, nftCtrl.validateNFTName);
nftrouters.route('/nftimageupload').post(nftCtrl.nftImageUpload);
nftrouters.route('/createnft').post(verifyToken, nftCtrl.createNewNFT);
nftrouters.route('/Tokenlistfunexplore').get(nftCtrl.Explore);
nftrouters.route('/Tokenlistfuncollection').get(nftCtrl.ExploreCollection);
nftrouters.route('/Tokenlistfunacution').get(nftCtrl.exploreauction);
nftrouters.route('/SearchAction').get(  nftCtrl.SearchAction);
nftrouters.route('/findupdatebalance').post(nftCtrl.Findupdatebalance);
nftrouters.route('/findOwners').get(DecryptDatas,nftCtrl.findOwners);
// add bid
nftrouters.route('/info').get(nftCtrl.info);
nftrouters.route('/myitemlist').post(nftCtrl.MyItemTokenlistfunc);
nftrouters.route('/CreateOrder').post(DecryptDatas, nftCtrl.CreateOrder)
nftrouters.route('/BuyAccept').post(DecryptDatas,verifyToken, nftCtrl.BuyAccept)
// BidAction 
nftrouters.route('/BidAction').post(DecryptDatas,verifyToken, nftCtrl.BidAction);
nftrouters.route('/CreateCollection').post(nftCtrl.CreateCollection)
nftrouters.route('/CollectionByCreator').get(nftCtrl.CollectionByCreator)
nftrouters.route('/editcollectionbycreator').post(DecryptDatas,nftCtrl.EditCollectionByCreator);
nftrouters.route('/CollectionBySymbol').get(nftCtrl.CollectionBySymbol)
nftrouters.route('/listcollectionnft').post(nftCtrl.ListCollectionNFT)
// bid
nftrouters.route('/activity').get(DecryptDatas,nftCtrl.Activity_api)
nftrouters.route('/fetchnfts').get(nftCtrl.OpenSeaFetch)

nftrouters.route('/stakenft').post(  DecryptDatas,nftCtrl.StackNft)
nftrouters.route('/fetchslug/:slug').get(nftCtrl.getcollectionbyslug)
nftrouters.route('/fetchslugsave/:slug').get(nftCtrl.Savecollectionbyslug)
nftrouters.route('/Collectionlist').get(nftCtrl.Collectionlist)

nftrouters.route('/Collectionstatus').put(DecryptDatas  ,  nftCtrl.CollectionChangeStatus)
// routers.route('/getpromotedtoken').get(nftCtrl.GetPromotedToken)
// routers.route('/updatetoken').post(verifyToken, nftCtrl.updatetoken)
// routers.route('/updatetokenHash').post(verifyToken, nftCtrl.updatetokenHash)



export default nftrouters;