const auth=require('../Service/auth');
// const cookieParser = require('cookie-parser');
exports.postauthrequest=(req,res,next)=>{
    const usercredentials=req.body;
    const token=auth.setUser(usercredentials);
    // const tokenDetails=auth.getUser(token);
    // Send token in cookie
  res.cookie('token', token, {
    // httpOnly: true, // Prevents JS access to the cookie (XSS protection)
    // secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    // sameSite: 'strict', // Protects against CSRF
    // maxAge: 60 * 60 * 1000 // 1 hour
  });
    res.status(200).json({ message: "token generated:", token });
}