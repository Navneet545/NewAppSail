const express=require('express');
const router=express.Router();
var catalyst = require('zcatalyst-sdk-node');
// var employeeController=require('./controller/employee');
var employeeController=require('../../controllers/employee');
const verifyToken=require('../../Middleware/authMiddleware');

// @GET Request
router.get('/',verifyToken.verifyToken, employeeController.getAllEmployee);

// @GET Request single employee id
router.get('/:id',employeeController.getSingleEmployee);

//@POST request bulk
router.post('/bulk',employeeController.bulkCreateEmployees);

// @POST Request single
router.post('/', employeeController.postSingleEmployee);

//@PUT Reqquest for single employee ID
router.put('/',employeeController.updateEmployee);

// @Patch Request for Bulk employee ID
router.patch('/bulk', employeeController.bulkPatchEmployee);

// @Patch an employee employee ID
router.patch('/:id', employeeController.patchSingleEmployee);

// @Delete Request an Employee ID
router.delete('/:id',employeeController.deleteSingleEmployee);

//@POST Request Image
// router.post('/image',employeeController.UploadImage);

module.exports=router;