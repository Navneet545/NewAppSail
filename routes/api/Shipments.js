const express=require('express');
const router=express.Router();
const shipment=require('../../controllers/Shipments');

router.get('/',shipment.getAllRecords);
router.get('/:Shipment_ID',shipment.getRecordByShipment);
router.post('/',shipment.createShipment);
router.patch('/:Shipment_ID',shipment.updateStatus);

module.exports=router;