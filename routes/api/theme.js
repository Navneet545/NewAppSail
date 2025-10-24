const express=require('express');
const router=express.Router();
var catalyst = require('zcatalyst-sdk-node');
var theme=require('../../controllers/theme');

router.get('/',theme.getlastRecord);
router.post('/',theme.addNewRecord);

module.exports=router;