const express=require('express');
const router=express.Router();
const userList=require('../../controllers/userList');

router.post('/register',userList.registerUser);
router.post('/login',userList.loginUser);
console.log(2);
router.post('/generateOTP',userList.generateOTP);
router.post('/verifyOTP',userList.verifyOTP);
router.patch('/updatePassword',userList.updatePassword);

module.exports=router;