var express=require('express');
var router=express.Router();
var thirdParty=require('../../controllers/thirdPartyAPI');

router.get('/',thirdParty.getCall);
router.get('/post',thirdParty.postCall);
router.get('/getCreator',thirdParty.getCreator);

module.exports=router;