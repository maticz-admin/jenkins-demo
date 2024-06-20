import { Router} from 'express';
import nftrouters from '../app/nft/nft.routes';
import userrouters from '../app/user/user.routes';
import adminroutes from '../app/admin/adminlogin/admin.routes';
import  cmsroutes from '../app/admin/cms/cms.routes';
import catroutes from '../app/category/category.routes';
import gamerouters from '../app/game/game.routes';
const routers = Router();

routers.use('/user' ,userrouters )
routers.use('/nft' ,nftrouters )
routers.use('/admin' ,adminroutes )
routers.use('/cms' , cmsroutes )
routers.use('/category' , catroutes )
routers.use('/game' , gamerouters )
export default routers




