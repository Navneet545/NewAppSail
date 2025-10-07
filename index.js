const express=require('express');
const errorHandler=require('./Middleware/errorHandler');
const { console } = require('inspector');
const employeeRoutes=require('./routes/api/employee');
const userRoutes=require('./routes/user');
const userListRoutes=require('./routes/api/userList');
const noSql=require('./routes/noSql');
const auth=require('./controllers/auth');
const cookieParser = require('cookie-parser');

const app=express();

const PORT=process.env.X_ZOHO_CATALYST_LISTEN_PORT || 8000;

// middleware to encode form data
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());
//employee routes
app.use('/api/employee',employeeRoutes);

// user routes
app.use('/user',userRoutes);
app.use('/noSql',noSql);

app.post('/api/auth',auth.postauthrequest);
// creating userList routes
console.log(1);
app.use('/api/userList',userListRoutes);
app.use(errorHandler);


app.listen(PORT,()=>{
    console.log(`server is running at localhost:${PORT}`);
});