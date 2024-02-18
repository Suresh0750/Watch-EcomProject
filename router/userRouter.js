
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


module.exports = userRouter