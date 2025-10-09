const jwt = require('jsonwebtoken');
// const jwt=require('jsonwebtoken');
const secret="Navneet@123@@";
const secret2="naveet@123";
var catalyst = require('zcatalyst-sdk-node');
const crypto = require('crypto');

function generateToken(user){
    return jwt.sign(user,secret);
}

const verifyToken = (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
    }
    try {
        const token2=decrypt(token);
        const decode = jwt.verify(token2, secret,(err,data)=>{
            if(!err)
            {
                console.log("verify:",data);
                req.user=data;
                next();
            }
            else{
                res.status(400).json({ message: "Token is not valid" });
            }
        });
        // console.log("The decoded value is :", decode);
        // next();
    }
    catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
}
//@handing permissions
const authorizeRoles=(...allowedRoles)=> {
  return async(req, res, next) => {
    var dbApp = catalyst.initialize(req);
    let zcql = dbApp.zcql();
    const userRole = req.user.Role; // assuming req.user is set by JWT middleware
    const query=`Select Role from userRoles Where ROWID=${userRole};`;
    const result=await zcql.executeZCQLQuery(query);
    if(!result){
        return res.status(400).json({message:"Resource not found"});
    }
    else{
        // console.log(result[0]);
        if (!allowedRoles.includes(result[0].userRoles.Role)) {
          return res.status(403).json({ message: 'Access denied' });
        }
    }
    next();
  };
}
// @encrypt-decrypt using ASH algorithm
const key = crypto.createHash('sha256').update(secret2).digest(); 
const iv = Buffer.alloc(16, 0); 

const encrypt=(text)=> {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

const decrypt=(encryptedText)=> {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
 

module.exports = {generateToken,verifyToken,authorizeRoles,encrypt,decrypt};