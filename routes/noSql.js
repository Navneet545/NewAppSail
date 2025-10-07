const express=require("express");
const catalyst = require("zcatalyst-sdk-node");
const router=express.Router();

router.get("/",async(req,res,next)=>
{
    try
    {
        const dbApp=catalyst.initialize(req);
        const noSql=dbApp.nosql();
        // Get metadata of all tables
        const allTables = await noSql.getAllTable();
        res.json(allTables);
        // res.send("noSql function triggerd !")

    }
    catch(err)
    {
        next(err);
    }
});
module.exports=router;