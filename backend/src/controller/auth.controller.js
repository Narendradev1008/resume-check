const userModel=require('../models/user.model');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const tokenBlacklistModel =require('../models/blacklist.model')
/**
 * @name registerUserController
 * @description new user registration expects username,email,password in req.body
 * @access public
 */
async function registerUserController(req,res){
  const {username ,email,password}=req.body;
    if(!username || !email || !password){
      return res.status(400).json({
        message:"please enter username email & password"
      })
    }
    const isUserAlreadyExists=await userModel.findOne({
      $or: [{username},{email}]
    })
    if(isUserAlreadyExists){
      //isUserAlreadyExists.username==username to make better message
      return res.status(400).json({
        message:"user already exists with this email or username"
      })
    }
    const hash=await bcrypt.hash(password,10);
    const user=await userModel.create({
      username,
      email,
      password:hash
    })
    const token=jwt.sign(
      {id:user._id,username:user.username},
      process.env.JWT_SECREAT,
      {expiresIn:"1d"}
    )
    res.cookie("token",token);
    res.status(201).json({
      message:"user create succesfully",
      user:{
        id:user._id,
        name:user.username,
        email:user.email
      }
    })
}

/**
 * @name loginusercontroller
 * @description expects email and password from req.body
 * @access public
 */
async function loginUsercontroller (req,res){
  const{email,password}=req.body;

  if (!email || !password) {
    return res.status(400).json({
      message:"please enter email and password"
    });
  }

  // findOne returns one user document; find returns an array.
  const user=await userModel.findOne({email});

  if(!user){
    return res.status(401).json({
      message:"invalid email or password"
    })
  }

  const isPasswordValid=await bcrypt.compare(password,user.password);
  if(!isPasswordValid){
    return res.status(401).json({
      message:"invalid email or password"
    });
  }
 const token =jwt.sign(
    {id:user._id, username:user.username},
    process.env.JWT_SECREAT,
    {expiresIn:"1d"}
  )
  res.cookie("token",token);
  res.status(200).json({
    message:"user loggedin succesfully",
    user:{
        id:user._id,
        name:user.username,
        email:user.email
      }
  })
}

/**
 * @name logoutusercontroller
 * @description remove toke from user and blacklist it
 * @access public
 */

async function logoutUserController(req,res){
  const token=req.cookies.token;
  if(token){
     await tokenBlacklistModel.create({token})
  }
  res.clearCookie("token");
  res.status(201).json({
    message:"user loggedout succesfully"
  })
}

/**
 * @name getMeController
 * @description get the current logged in user detail
 * @access private
 */
async function getMeController(req,res){
  const user=await userModel.findById(req.user.id);
  if(!user) {
      return res.status(404).json({ message: "User not found" });
    }
  res.status(201).json({
    message:"user details fetched succesfully",
    user:{
      id:user._id,
      username:user.username,
      email:user.email,
    }
  })
}


module.exports={registerUserController,loginUsercontroller,logoutUserController,getMeController}
