const express=require('express');
const errorHandler=require('./Middleware/errorHandler');
const { console } = require('inspector');
const employeeRoutes=require('./routes/api/employee');
const userRoutes=require('./routes/user');
const userListRoutes=require('./routes/api/userList');
const theme=require("./routes/api/theme");
const thirdParty=require('./routes/api/thirdPartyAPI');
const shipment=require('./routes/api/Shipments');

const noSql=require('./routes/noSql');
const auth=require('./controllers/auth');
const cookieParser = require('cookie-parser');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
// var employeeController=require('./controllers/employee');

const app=express();

const PORT=process.env.X_ZOHO_CATALYST_LISTEN_PORT || 8000;

// middleware to encode form data
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());

// app.post('/fileUpload',upload.single("doc"),employeeController.fileUpload);
//employee routes
app.use('/api/employee',employeeRoutes);

// Shipments router
app.use('/api/shipments',shipment);

// user routes
app.use('/user',userRoutes);
app.use('/noSql',noSql);

app.post('/api/auth',auth.postauthrequest);
// creating userList routes
// console.log(1);
app.use('/api/userList',userListRoutes);
// theme routes
app.use('/api/theme',theme);

app.use('/api/thirdparty',thirdParty);

app.use(errorHandler);


app.listen(PORT,()=>{
    console.log(`server is running at localhost:${PORT}`);
});