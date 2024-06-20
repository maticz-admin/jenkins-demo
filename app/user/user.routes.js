import { Router} from 'express'
import * as userCtrl from  './user.controller'
import { DecryptDatas } from '../../shared/credentialsetup';
import { verifyToken } from '../../shared/credentialsetup';
const userrouters = Router()

userrouters.route('/create').post(DecryptDatas,userCtrl.UserRegister);
userrouters.route('/edit').post(verifyToken,DecryptDatas,userCtrl.Editprofile);
userrouters.route('/connect').post(DecryptDatas,userCtrl.InitialConnect);
userrouters.route('/FollowUnFollow').post(verifyToken,userCtrl.FollowUnFollow);
userrouters.route('/newsletter').post(DecryptDatas,userCtrl.Newsletter);
// routers.route('/getuserregister').get(userCtrl.getuserregister)
userrouters.route('/getprofile/:CustomUrl').get( userCtrl.getprofile);
userrouters.route('/notification').get(verifyToken , userCtrl.notification)
userrouters.route('/profileimage').put(verifyToken,userCtrl.profileimage);
userrouters.route('/coverimage').put(verifyToken,userCtrl.coverimage);
userrouters.route('/getbalance').get(userCtrl.getbalance);
userrouters.route('/addbalance').post(userCtrl.addbalance);
userrouters.route('/creategameuser').post(userCtrl.CreateGameUser);
userrouters.route('/gameconnect').post(userCtrl.GameConnect);




userrouters.route('/deletediplayname').post(userCtrl.deletewithdisplay);

export default userrouters; 
