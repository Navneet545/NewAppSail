const jwt = require('jsonwebtoken');
// const jwt=require('jsonwebtoken');
const secret="Navneet@123@@";

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
        const decode = jwt.verify(token, secret);
        console.log("The decoded value is :", decode);
        next();
    }
    catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
}
module.exports = {generateToken,verifyToken};