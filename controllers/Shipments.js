// var express=require('express');
var catalyst=require('zcatalyst-sdk-node');

//@GET All records
exports.getAllRecords=async(req,res,next)=>{
    let dbApp=catalyst.initialize(req);
    let zcql=dbApp.zcql();

    let query=`Select * From Shipments`;
    let result=await zcql.executeZCQLQuery(query);

    if (result.length === 0) {
        return res.status(404).json({ message: "No records available" });
    }

    return res.status(200).json({message:"Find all the records from shipments",result});
}

//@Get a single record by shipment ID
exports.getRecordByShipment = async (req, res, next) => {
    try {
        let dbApp = catalyst.initialize(req);
        let zcql = dbApp.zcql();
        let Shipment_ID = req.params.Shipment_ID;

        if (!Shipment_ID) {
            return res.status(400).json({ message: "Shipment ID not provided" });
        }

        let query = `SELECT * FROM Shipments WHERE Shipment_ID='${Shipment_ID}'`;
        let result = await zcql.executeZCQLQuery(query);

        if (result.length === 0) {
            return res.status(404).json({ message: "No records available" });
        }

        return res.status(200).json({message: "Shipment details found",result});

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};


//@POST (Insert Record)
exports.createShipment=async(req,res,next)=>{
    let dbApp=catalyst.initialize(req);
    let zcql=dbApp.zcql();

    let Shipment_ID=req.body.Shipment_ID;
    let Pickup_Date=req.body.Pickup_Date;
    let Customer=req.body.Customer;
    let Origin=req.body.Origin;
    let Destination=req.body.Destination;
    let Number_of_Boxes=req.body.Number_of_Boxes;
    let Box_Description=req.body.Box_Description;
    let Status="35003000000141022"; // Data Received
    // console.log(Status);
    if(!Shipment_ID || !Pickup_Date || !Customer || !Origin || !Destination || !Number_of_Boxes || !Box_Description)
    {
        return res.status(400).json({message:"Shipment_ID,Pickup_Date,Customer,Origin,Destination,Number_of_Boxes,Box_Description are mandatory"});
    }
    // fetching customer ROWID
    let queryCustomer=`Select * From Customers Where ROWID='${Customer}'`;
    let resultCustomer=await zcql.executeZCQLQuery(queryCustomer);
    if(!resultCustomer[0]){
        return res.status(400).json({message:"You have entered a wrong Customer ID"});
    }

    // fetching ORIGIN rowID
    let queryOrigin=`Select * From Branch Where Branch_Name='${Origin}'`;
    let resultOrigin=await zcql.executeZCQLQuery(queryOrigin);
    if(!resultOrigin[0]){
        return res.status(400).json({message:"You have entered a wrong origin Name"});
    }
    Origin_RID=resultOrigin[0].Branch.ROWID;

    // fetching Destination RowID
    let queryDestination=`Select * From Branch Where Branch_Name='${Destination}'`;
    let resultDestination=await zcql.executeZCQLQuery(queryDestination);
    if(!resultDestination[0]){
        return res.status(400).json({message:"You have entered a wrong desination Name"});
    }
    Destination_RID=resultDestination[0].Branch.ROWID;
   
    let query=`Insert into Shipments (Shipment_ID, Pickup_Date, Customer, Origin, Destination, Number_of_Boxes, Box_Description, Status) Values('${Shipment_ID}','${Pickup_Date}', ${Customer}, ${Origin_RID}, ${Destination_RID}, ${Number_of_Boxes}, '${Box_Description}', ${Status})`;
    let result=await zcql.executeZCQLQuery(query);
    if(!result){
        return res.status(400).json({message:"Error occurs during the insert statement"});
    }
    return res.status(200).json({message:"Your shipment has been recorded successfully"});

}

exports.updateStatus=async(req,res,next)=>{
    // try{
        var dbApp=catalyst.initialize(req);
        var zcql=dbApp.zcql();

        let shipment_ID=req.params.Shipment_ID;
        let status=req.body.Status;

        let queryTOFindStatus=`Select * From Shipment_Status Where Status_Description='${status}';`;
        let resultStatus= await zcql.executeZCQLQuery(queryTOFindStatus);
        if(resultStatus.length===0){
            return res.status(400).json({message:"This status is not available"});
        }
        // console.log(resultStatus);

        let query=`Select * From Shipments Where Shipment_ID='${shipment_ID}';`;
        let result=await zcql.executeZCQLQuery(query);
        if(result.length===0){
            return res.status(404).json({message:"Shipment ID does not exist"});
        }
        // console.log(result);

        let queryUpdate=`Update Shipments Set Status=${resultStatus[0].Shipment_Status.ROWID} Where Shipment_ID='${shipment_ID}';`
        // console.log(queryUpdate);
        let resultUpdate=await zcql.executeZCQLQuery(queryUpdate);
        if(!resultUpdate){
            return res.status(500).json({message:"error occured during update status"});
        }
        return res.status(200).json({message:"Status updated successfully"});
    // }
    // catch(err)
    // {
    //     return res.status(500).json({message:"catch section error occured during update status",err});
    // }
}