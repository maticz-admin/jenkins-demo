import { Router } from "express";
import * as admincontroller from './admin.controller'
import { Authendicateadmin } from "./admin.service";
import { DecryptDatas } from "../../../shared/credentialsetup";
const adminroutes = Router()
adminroutes.route('/adminlogin').post(DecryptDatas,admincontroller.loginAdmin)

adminroutes.route('/userlist').get(Authendicateadmin,admincontroller.userlist)
adminroutes.route('/userdetail').post(Authendicateadmin,admincontroller.userdetail)
adminroutes.route('/banuser').put(Authendicateadmin,admincontroller.Banuser)

module.exports = adminroutes;