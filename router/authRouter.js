
const express = require("express")
const router = express.Router()
const authController = require("../controller/authController")

const {isUser,isBlock} = require("../middlewares/userMiddleware")


// get Method render

router.get("/confirmPass",authController.confirmPass) // render confirm password for forgotPassword
router.get("/login",authController.loginPage)
router.get("/register",authController.registerPage)
router.get("/pass",authController.forgetPage)
router.get("/forgetEmailOtp",authController.forgetOtp)// forgetPassword otp page rendered
router.get("/otpPage",authController.otpPage)// register otp page
//post method with data

router.post("/updatePass:id",authController.updatePass)
router.post("/fPO:id",authController.fOP)
router.post("/forgetPass:id",authController.isEmailThere)// check email for forget Password
router.post("/userLogin",isBlock,authController.userLogin)// loginUser
router.post("/emailOtp",authController.emailOtp)
router.post("/signUp",authController.signUp)
router.post("/otpValue:id",authController.otpvalue)
router.post("/resendOtp",authController.resendOtp)

// admin 
router.get("/admin",authController.admin)
router.post("/adminData",authController.adminVerfy)



// //* google authendication

router.get("/googleLogin",authController.googleLogin)
router.get("/googleLoginFail",authController.googleLoginFail)

module.exports = router
