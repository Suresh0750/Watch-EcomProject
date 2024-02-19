const express = require("express")

const shopRouter = express.Router()

const shopControler = require("../controller/shopController.js")

const {isUser,isBlock} = require("../middlewares/userMiddleware.js")

shopRouter.get("/",shopControler.landingPage)
shopRouter.get("/grid",isUser,isBlock,shopControler.gridcategorisProduct)
shopRouter.get("/categories",isUser,isBlock,shopControler.categoriesProduct)
shopRouter.get("/singleProduct:id",isUser,isBlock,shopControler.singleProduct)
shopRouter.post("/logOut",isUser,isBlock,shopControler.logOut)
shopRouter.post("/addCart:id",isUser,isBlock,shopControler.addCart)


//veiw cart
shopRouter.get("/viewCart",isUser,isBlock,shopControler.userCartPage)
shopRouter.delete("/deletCart:id",shopControler.deletCart)

// userIncrease product

shopRouter.put("/cart/inCrease",isUser,isBlock,shopControler.incQty)
shopRouter.put("/cart/deCrease",isUser,isBlock,shopControler.decQty)

module.exports = shopRouter