const errorHandler=(err,req,res,next)=>{
    console.log("error handling triggered !!");
const statuscode=res.statuscode ? res.statuscode:500;
switch (statuscode) {
    case 200:
        console.log(1);
        res.json({
            title:"internal error",
            message:"internal server issue"
        });
        break;
    case 404:
        console.log(2);
        res.json({
            title:"No Record",
            message:"No record found !!"
        });
        break;
    default:
        console.log(err);
        res.json({title:"default case!!",message:err});
        break;
}
};

module.exports = errorHandler;