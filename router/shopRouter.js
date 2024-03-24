const express = require("express")

const shopRouter = express.Router()

const shopControler = require("../controller/shopController.js")

const {isUser,isBlock} = require("../middlewares/userMiddleware.js")
const {allProductCoupen} = require("../controller/userShopCoupen.js")

shopRouter.get("/",shopControler.landingPage)
shopRouter.get("/categories",shopControler.categoriesProduct)
shopRouter.get("/singleProduct:id",isUser,isBlock,shopControler.singleProduct)
shopRouter.post("/logOut",isUser,isBlock,shopControler.logOut)
shopRouter.post("/addCart:id",isUser,isBlock,shopControler.addCart)

// filter product 

shopRouter.get("/categories/filter",shopControler.categoriesFilter)
shopRouter.post("/priceWiseFilter:id",shopControler.priceFilter)
shopRouter.post("/sortPrice:id",shopControler.sortPrice)


// search

shopRouter.post("/search",shopControler.search)



//veiw cart
shopRouter.get("/viewCart",isUser,isBlock,shopControler.userCartPage)
shopRouter.delete("/deletCart:id",shopControler.deletCart)


// checkout Page

shopRouter.get("/Checkout",isUser,isBlock,shopControler.checkout)



// shop receive page
shopRouter.get("/orderReceivedPage",isUser,isBlock,shopControler.orderReceivedPage)
shopRouter.post("/orderReceived",isUser,isBlock,shopControler.orderReceived)
shopRouter.post("/genOrder",isBlock,shopControler.genOrder)
shopRouter.all("/checkout/orderPlaced",isBlock,shopControler.orderPlaced)

// userIncrease product

shopRouter.put("/cart/inCrease",isUser,isBlock,shopControler.incQty)
shopRouter.put("/cart/deCrease",isUser,isBlock,shopControler.decQty)



// userCoupen 
shopRouter.post("/shopCoupen",isBlock,allProductCoupen)

module.exports = shopRouter