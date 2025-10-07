var catalyst = require('zcatalyst-sdk-node');
const bcrypt = require('bcrypt');
// const auth=require('../Service/auth');
const auth=require('../Middleware/authMiddleware');
const moment=require('moment');
// @register user
exports.registerUser = async (req, res, next) => {
    try {
        // console.log(req.body.firstName);
        var dbApp = catalyst.initialize(req);
        var zcql = dbApp.zcql();
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const email = req.body.email;
        const role = req.body.Role;
        // const avb="35003000000093887";
        const password = req.body.password;
        // 4. Basic validation (optional but good practice)
        if (!firstName || !lastName || !email || !role || !password) {
            return res.status(400).json({
                message: "All fields (firstName, lastName, email, Role, password) are required.",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        let query = `INSERT INTO UserList (firstName, lastName, email, password, Role) VALUES ('${firstName}','${lastName}','${email}','${hashedPassword}',${role});`;
        console.log(query);
        const result = await zcql.executeZCQLQuery(query);
        res.status(200).json({ message: "User created successfully!", result });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            message: "Failed to register user.",
            error: error.message || error
        });
    }
};


//@login user
exports.loginUser = async (req, res, next) => {
    // try {
        var dbApp = catalyst.initialize(req);
        var zcql = dbApp.zcql();
        // console.log(req.body);
        const email = req.body.email;
        const password = req.body.password;

        let query = `SELECT * FROM UserList WHERE email='${email}';`;
        // console.log(query);
        const result = await zcql.executeZCQLQuery(query);
        // res.status(200).json({message:"user logged in successfull",result})  

        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Invalid user email!" });
        }

        const bcryptPassword = await bcrypt.compare(password, result[0].UserList.password);
        if (!bcryptPassword) {
           return res.status(404).json({ message: "Invalid user password!" });
        }
        // const token=auth.setUser(result[0].UserList);
        const token=auth.generateToken(result[0].UserList);
        return  res.status(200).json({ message: "User login successfully!" ,token});
    // }
    // catch (err) {
    //    return res.status(500).json({ message: err });
    // }
};


// @reset password
//@generate OTP
exports.generateOTP=async(req,res,next)=>{
    //  try{
        console.log(3);
        // res.status(200).json({message:"3"});
        var dbApp = catalyst.initialize(req);
        var zcql = dbApp.zcql();
        const email=req.body.Email;
        const otp = Math.round(Math.random() * 100000);
        const dt=new Date();
        const dte=moment(dt).format('YYYY-MM-DD hh:mm:ss');
        console.log(dte);
        const query=`Insert into OTP (Email,OTP,Expiry_Time) values('${email}',${otp},'${dte}');`;
        const result=await zcql.executeZCQLQuery(query);
        if(!result )
        {
            res.status(400).json({message:'Otp generation issue'});
        }
        res.status(200).json({message:'OTP:',otp});
        //   console.log(otp);
        // res.json({ "New OTP": otp });
    //  }
    //  catch(err)
    //  {
    //     next();
    //  }
}

// @verify OTP
exports.verifyOTP=async(req,res,next)=>{
    try{
        var dbApp = catalyst.initialize(req);
        var zcql = dbApp.zcql();
        const email=req.body.Email;
        const otp=Number(req.body.OTP);
        const query=`Select * from OTP where Email='${email}' order by Expiry_Time desc Limit 1;`;
        const result=await zcql.executeZCQLQuery(query);
        console.log(new Date(result[0].OTP.Expiry_Time));
        console.log(new Date());
        if(Number(result[0].OTP.OTP) === otp && new Date(result[0].OTP.Expiry_Time) > new Date()){
            res.status(200).json({message:'OTP Verified successful',otp});
        }
        res.status(400).json({message:'Wrong OTP'});
    }
    catch(err)
    {
        next();
    }

}
//@Update password
exports.updatePassword=async(req,res,next)=>{
        var dbApp = catalyst.initialize(req);
        var zcql = dbApp.zcql();
        const email=req.body.Email;
        const otp=Number(req.body.OTP);
        const password=req.body.Password;
        const query=`Select * from OTP where Email='${email}' order by Expiry_Time desc Limit 1;`;
        const result=await zcql.executeZCQLQuery(query);
        console.log(new Date(result[0].OTP.Expiry_Time));
        console.log(new Date());
        const expiry_date=new Date(result[0].OTP.Expiry_Time);
        if(Number(result[0].OTP.OTP) === otp && expiry_date.setTime(expiry_date.getTime() + 2 * 60 * 1000) > new Date()){
            const bcryptPassword=await bcrypt.hash(password, 10);

            const query2=`Update UserList Set password='${bcryptPassword}'`;
            const result2=await zcql.executeZCQLQuery(query2);
            if(!result2){
                return res.status(400).json({message:"Unable to update password"});
            }
            return res.status(200).json({message:'Password Updated'});
        }
        // else{

            return res.status(400).json({message:'Wrong OTP'});
        // }
}