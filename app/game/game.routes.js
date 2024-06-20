import { Router } from 'express';
import * as Ctrl from './game.controller';
import { DecryptDatas, verifyToken } from '../../shared/credentialsetup';
const gamerouters = Router();



gamerouters.post('/builds' , Ctrl.createBuild)
gamerouters.get('/buildlist/:walletaddress' ,Ctrl.UserBuildList)
gamerouters.post('/addasset' ,Ctrl.addAsset)
gamerouters.post('/assetbyplanetid' ,Ctrl.AssetByPlanetId)
gamerouters.post('/createuserasset' ,Ctrl.createUserAsset)
gamerouters.get('/userassetlist' ,Ctrl.UserAssetList)
gamerouters.put('/updateuserassetlevel',verifyToken,Ctrl.UserAssetLevelUp)
gamerouters.get('/planetlist',Ctrl.PlanetList)
gamerouters.post('/buyplanet',Ctrl.BuyPlanet)
// for before production

// gamerouters.get('/addplanets',Ctrl.PlanetList)



gamerouters.post('/addplanets',Ctrl.AddPlanet)

export default gamerouters