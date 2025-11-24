var catalyst = require('zcatalyst-sdk-node');
const bcrypt = require('bcrypt');
// const auth=require('../Service/auth');
const auth=require('../Middleware/authMiddleware');
// const moment=require('moment');
const moment = require('moment-timezone');
const transporter=require("../Service/mailConfig");
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
        // Store token in cookie (httpOnly for security)
        res.cookie('token1', token, {
            httpOnly: true,      // Prevents JavaScript access to cookie
            secure: false,       // Set to true in production (with HTTPS)
            sameSite: 'strict',  // CSRF protection
            maxAge: 3600000      // 1 hour
        });
        // console.log("JWT token:",token);
        // const encryptToken=auth.encrypt(token);
        // console.log("ASH encrypted token:",encryptToken);
        return  res.status(200).json({ message: "User login successfully!",token});
    // }
    // catch (err) {
    //    return res.status(500).json({ message: err });
    // }
};

// @OTP create function
const crypto = require("crypto");
function createOTP(length = 6){
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomByte = crypto.randomBytes(1)[0];
    otp += digits[randomByte % digits.length];
  }
  return otp;
}
// @reset password
//@generate OTP through record otp in db (OLD)
exports.generateOTPOLD=async(req,res,next)=>{
    //  try{
        
        var dbApp = catalyst.initialize(req);
        var zcql = dbApp.zcql();
        const email=req.body.Email;
        // const otp = Math.round(Math.random() * 100000);
        const otp=createOTP(length = 6);
        const dt=new Date();
        dt.setMinutes(dt.getMinutes() + 15);
        const dte=moment.tz(dt, 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
      
         let query = `SELECT * FROM UserList WHERE email='${email}';`;
        const userResult = await zcql.executeZCQLQuery(query);
        if(userResult[0]){
            const fetchQuery=`Select Email From OTP Where Email='${email}' order by Expiry_Time desc Limit 1;`;
            const fetchResult=await zcql.executeZCQLQuery(fetchQuery);
            if(fetchResult[0])
            {
                const query=`Update OTP Set OTP=${otp},Expiry_Time='${dte}' Where Email='${email}';`;
                const result=await zcql.executeZCQLQuery(query);
                if(!result)
                {
                    return res.status(400).json({message:'Otp generation issue'});
                }
                const mailOptions = {
                    from: "vtruact.testing@gmail.com",
                    to: `${email}`,
                    subject: `Your One-Time Password (OTP) for Update account details`,
                    html: `<div>Hello ${email},<br><br>Your One-Time Password (OTP) is ${otp}.<br> This OTP is valid for 15 minutes. Please do not share it with anyone for your security.If you did not request this, please ignore this email or contact our support team immediately.<br><br>Thank You,<br>Navneet</div>`
                    // html: "<h1>Hello</h1><p>This is a test email!</p>" // optional HTML body
                };
                transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log("Error sending email:", error);
                }
                console.log("OTP sent successfully:", info.response);
                });
                return res.status(200).json({message:'OTP:',otp});
            }
            else{
                const query=`Insert into OTP (Email,OTP,Expiry_Time) values('${email}',${otp},'${dte}');`;
                const result=await zcql.executeZCQLQuery(query);
                if(!result )
                {
                    res.status(400).json({message:'Otp generation issue'});
                }
                const mailOptions = {
                    from: "vtruact.testing@gmail.com",
                    to: `${email}`,
                    subject: `Your One-Time Password (OTP) for Update account details`,
                    html: `<div>Hello ${email},<br><br>Your One-Time Password (OTP) is ${otp}.<br> This OTP is valid for 15 minutes. Please do not share it with anyone for your security.If you did not request this, please ignore this email or contact our support team immediately.<br><br>Thank You,<br>Navneet</div>`
                    // html: "<h1>Hello</h1><p>This is a test email!</p>" // optional HTML body
                };
                transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log("Error sending email:", error);
                }
                console.log("OTP sent successfully:", info.response);
                });
                res.status(200).json({message:'OTP:',otp});
            }
        }
        else{
            return res.status(400).json({message:"Not a valid User"});
        }
        
        
    //  }
    //  catch(err)
    //  {
    //     next();
    //  }
}

// @verify OTP OLD
exports.verifyOTPOLD=async(req,res,next)=>{
    try{
        var dbApp = catalyst.initialize(req);
        var zcql = dbApp.zcql();
        const email=req.body.Email;
        const otp=Number(req.body.OTP);
        const query=`Select * from OTP where Email='${email}' order by Expiry_Time desc Limit 1;`;
        const result=await zcql.executeZCQLQuery(query);
        // console.log(result[0].OTP.OTP);
        // console.log(new Date(result[0].OTP.Expiry_Time));
        // console.log(new Date());
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
//@Update password OLD
exports.updatePasswordOLD=async(req,res,next)=>{
        var dbApp = catalyst.initialize(req);
        var zcql = dbApp.zcql();
        const email=req.body.Email;
        const otp=Number(req.body.OTP);
        const password=req.body.Password;
        const query=`Select * from OTP where Email='${email}' order by Expiry_Time desc Limit 1;`;
        const result=await zcql.executeZCQLQuery(query);
        // console.log(new Date(result[0].OTP.Expiry_Time));
        // console.log(new Date());
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

//@logout 
exports.logout=async(req,res,next)=>{
    res.clearCookie('token1'); 
    res.status(200).json({ message: 'Logged out and cookies cleared' });
}

//@generate otp through cache (NEW)
exports.generateOTP=async(req,res,next)=>{
    //  try{
        
        var dbApp = catalyst.initialize(req);
        var zcql = dbApp.zcql();
        const email=req.body.Email;
        // const otp = Math.round(Math.random() * 100000);
        const otp=createOTP(length = 6);
        const dt=new Date();
        dt.setMinutes(dt.getMinutes() + 15);
        const dte=moment.tz(dt, 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
      
         let query = `SELECT * FROM UserList WHERE email='${email}';`;
        const userResult = await zcql.executeZCQLQuery(query);
        if(userResult[0]){
            let key=email;
            let cache = dbApp.cache();
            let segment = cache.segment("35003000000109261");
            const value = otp + "," + dte;
            let segmentInsert = await segment.update(key, value, 1);
            console.log(segmentInsert);
            const mailOptions = {
                    from: "vtruact.testing@gmail.com",
                    to: `${email}`,
                    subject: `Your One-Time Password (OTP) for Update account details`,
                    html: `<div>Hello ${email},<br><br>Your One-Time Password (OTP) is ${otp}.<br> This OTP is valid for 15 minutes. Please do not share it with anyone for your security.If you did not request this, please ignore this email or contact our support team immediately.<br><br>Thank You,<br>Navneet</div>`
                    // html: "<h1>Hello</h1><p>This is a test email!</p>" // optional HTML body
                };
                transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log("Error sending email:", error);
                }
                console.log("OTP sent successfully:", info.response);
                });
            return res.status(201).json({ Message: "OTP sent successfully" });
        }
        else{
            return res.status(400).json({message:"Not a valid User"});
        }
        
        
    //  }
    //  catch(err)
    //  {
    //     next();
    //  }
}


// @verify otp based on cache (NEW)
exports.verifyOTP = async (req, res, next) => {
    try {
        const dbApp = catalyst.initialize(req);
        const email= req.body.Email;
        const otp=req.body.OTP;

        const cache = dbApp.cache();
        const segment = cache.segment("35003000000109261");

        // Get cached value
        const entity = await segment.getValue(email);

        if (!entity) {
            return res.status(404).json({ message: "OTP has been expired, please re-generate otp" });
        }

        const storedOTP = entity.split(",")[0];
        const storedExpiry = entity.split(",")[1];

        if (Number(storedOTP) !== Number(otp)) {
            return res.status(400).json({ message: "Wrong OTP!" });
        }
        else if(Number(storedOTP == Number(otp)) && new Date(storedExpiry) > new Date()){
            return res.status(200).json({ message: "OTP verification successful! Please update your credentials within 15 min.", otp });
        }
        
        return res.status(400).json({ message: "Otp has been expired" });
    }
    catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


//@Update password (NEW)
exports.updatePassword=async(req,res,next)=>{
        var dbApp = catalyst.initialize(req);
        var zcql = dbApp.zcql();
        const email=req.body.Email;
        const otp=Number(req.body.OTP);
        const password=req.body.Password;
        const cache = dbApp.cache();
        const segment = cache.segment("35003000000109261");

        // Get cached value
        const entity = await segment.getValue(email);

        if (!entity) {
            return res.status(404).json({ message: "OTP has been expired, please re-generate otp"});
        }

        const storedOTP = entity.split(",")[0];
        const storedExpiry = entity.split(",")[1];

        if (Number(storedOTP) !== Number(otp)) {
            return res.status(400).json({ message: "Wrong OTP!" });
        }
        else if(Number(storedOTP == Number(otp)) && new Date(storedExpiry) > new Date()){
                const bcryptPassword=await bcrypt.hash(password, 10);
    
                const query2=`Update UserList Set password='${bcryptPassword}'`;
                const result2=await zcql.executeZCQLQuery(query2);
                if(!result2){
                    return res.status(400).json({message:"Unable to update password"});
                }
                return res.status(200).json({message:'Password Updated'});
        } 
        return res.status(400).json({ message: "Otp has been expired" });
}