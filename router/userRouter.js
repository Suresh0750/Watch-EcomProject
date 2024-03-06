
const express = require("express")

const userRouter = express.Router()

const {isUser,isBlock} = require("../middlewares/userMiddleware.js")

const userControll = require("../controller/userControll.js")


userRouter.get("/profile",isUser,isBlock,userControll.profile)
userRouter.get("/addAddress",isUser,isBlock,userControll.addAddress)
userRouter.get("/myAddress",isUser,isBlock,userControll.myAddress)
userRouter.post("/addAddress",isUser,isBlock,userControll.addAddressData)

userRouter.delete("/daleteAdd:id",isUser,isBlock,userControll.daleteAdd)
userRouter.get("/editAddress:id",isUser,isBlock,userControll.editAddress)
userRouter.put("/editUserData",isUser,isBlock,userControll.editUserData)
userRouter.get("/changePassword",isUser,isBlock,userControll.changePassword)

userRouter.get("/editProfile:id",isUser,isBlock,userControll.editProfile)              // edit profile is rendered
userRouter.put("/editAndUpdateProfile",isUser,isBlock,userControll.editAndUpdateProfile)

userRouter.get("/userOTPpage",isUser,isBlock,userControll.userOTPpage)
userRouter.post("/userOtpValue",userControll.userOtpValue)

// user change password

userRouter.patch("/updateUserPass",userControll.updateUserPass)



// all orders in user

userRouter.get("/orders",isUser,isBlock,userControll.allOrders)
userRouter.get("/orderDetails:id",isUser,isBlock,userControll.orderDetails)
userRouter.patch("/cancelorder",userControll.cancelorder)
userRouter.patch("/returnOrder",userControll.returnOrder)

module.exports = userRouter