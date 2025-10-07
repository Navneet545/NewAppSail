const jwt=require('jsonwebtoken');
const secret="Navneet@123@@";

function setUser(user){
    return jwt.sign(user,secret);
}

function getUser(token){
    return jwt.verify(token,secret);
}

module.exports={
    setUser,
    getUser
}