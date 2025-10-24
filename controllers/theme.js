// var express=require("express");
var catalyst = require('zcatalyst-sdk-node');

exports.getlastRecord=async(req,res, next)=>{
    let dbApp=catalyst.initialize(req);
    let zcql=dbApp.zcql();

    let query=`Select * from Theme Order by CREATEDTIME Desc Limit 1;`;
    let result=await zcql.executeZCQLQuery(query);
    if(result[0]){
        return res.status(200).json({message:"Request successfull",result});
    }
    else{
        return res.status(404).json({message:"No record found!"});
    }
}

exports.addNewRecord=async(req,res , next)=>{
    let dbApp=catalyst.initialize(req);
    let zcql=dbApp.zcql();

    let primaryColor=req.body.primaryColor;
    let secondaryColor=req.body.secondaryColor;
    let tertiaryColor=req.body.tertiaryColor;
    if(!primaryColor || !secondaryColor ||!tertiaryColor){
        return res.status(500).json({mesage:"Primary, secondary and tertiary colors are mandatory"});
    }
    let query=`Insert into Theme (primaryColor,secondaryColor,tertiaryColor) Values('${primaryColor}','${secondaryColor}','${tertiaryColor}');`;
    let result=await zcql.executeZCQLQuery(query);
    if(result){
        return res.status(200).json({message:"Theme added successfull",result});
    }
    else{
        return res.status(404).json({message:"No record found!"});
    }
}