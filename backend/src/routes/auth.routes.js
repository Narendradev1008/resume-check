const express=require('express');
const authRouter=express.Router();
const authController=require('../controller/auth.controller')
/**
 * @Routes post api/auth/register
 * @description new user registration
 * @access public
 */
authRouter.post("/register",authController.registerUserController);
/**
 * @Routes post api/auth/login
 * @description login user with email and password
 * @acess public
 */
authRouter.post('/login',authController.loginUsercontroller);
/**
 * @ROUTES GET api/auth/logout
 * @description remove token from user
 * @access public
 */
authRouter.get('/logout',authController.logoutUserController)

/**
 * @Routes get api/aut/get-me
 * @description to get user detail
 * @access private
 */
authRouter.get('/get-me',authController.getMeController);
module.exports=authRouter;