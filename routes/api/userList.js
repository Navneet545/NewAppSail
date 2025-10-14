const express=require('express');
const router=express.Router();
const userList=require('../../controllers/userList');

router.post('/register',userList.registerUser);
router.post('/login',userList.loginUser);
console.log(2);
// @OLD generate otp, verifyotp, update password
router.post('/generateOTPOLD',userList.generateOTPOLD);
router.post('/verifyOTPOLD',userList.verifyOTPOLD);
router.patch('/updatePasswordOLD',userList.updatePasswordOLD);
// @new generate otp,verifyotp, update password
router.post('/generateOTP',userList.generateOTP);
module.exports=router;