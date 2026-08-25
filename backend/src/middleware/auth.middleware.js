const jwt=require('jsonwebtoken');
const tokenBlacklistModel=require('../middleware/auth.middleware')

async function authUser(req,res,next){
  const token=req.cookies.token;
  if(!token){
    return res.status(401).json({
      message:"token not provided"
    })
  }
  const isBlacklisted= await tokenBlacklistModel.findOne({token});
  if(isBlacklisted){
    return res.status(201).json({
      message:"invalid token"
    })
  }
  try{
  const decoded =jwt.verify("token",process.env.JWT_SECREAT);
  req.user=decoded;
  next();
  }
  catch(err){
    res.status(401).json({
      message:"invalid token"
    })
  }
}
module.exports={authUser};