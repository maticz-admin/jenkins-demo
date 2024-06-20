import { Authendicateadmin } from '../adminlogin/admin.service'
import * as cmscontroller from './cms.controller'

import { Router } from "express";
import { DecryptDatas } from '../../../shared/credentialsetup';
const cmsroutes = Router()

cmsroutes.route('/faqlists').get(cmscontroller.FaqList)
cmsroutes.route('/updatefaq').put(Authendicateadmin,DecryptDatas,cmscontroller.FaqUpdate)
cmsroutes.route('/addfaq').post(Authendicateadmin,cmscontroller.FaqAdd)
cmsroutes.route('/deletefaq/:id').delete(Authendicateadmin,cmscontroller.FaqDelete)

cmsroutes.route('/cmsdetail').get(DecryptDatas , cmscontroller.CmsDetails)
cmsroutes.route('/editcms').post(DecryptDatas,cmscontroller.CmsUpdate)

cmsroutes.route('/roadmapList').get(cmscontroller.RoadmapList)
cmsroutes.route('/roadmapupdate').put(Authendicateadmin , DecryptDatas,cmscontroller.RoadmapUpdate)

cmsroutes.route('/contactuslist').get(  cmscontroller.Subcribelist)

cmsroutes.route('/planetlist').get(cmscontroller.planetlist)
cmsroutes.route('/planetupdate').put(cmscontroller.planetupdate)
cmsroutes.route('/cmslist').get(cmscontroller.cmslist)
cmsroutes.route('/currencylist').get(cmscontroller.getCurrencyList);

cmsroutes.route('/poollist').get(cmscontroller.PoolList)
cmsroutes.route('/poolupdate').put(Authendicateadmin,DecryptDatas,cmscontroller.Poolupdate)
cmsroutes.route('/poolstatus').put(Authendicateadmin , DecryptDatas , cmscontroller.PoolHide)
cmsroutes.route('/poolcreate').post(Authendicateadmin,DecryptDatas,cmscontroller.PoolCreate)
cmsroutes.route('/createcurrency').post(cmscontroller.createcurrency)

module.exports = cmsroutes