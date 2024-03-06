
const express = require("express")

const adminRouter = express.Router()

const  uploadImage = require("../helper/multer")

const adminController = require("../controller/adminController")
const adCatagoriescontrol = require("../controller/adminCatogoricontroller")
const adminProduct = require("../controller/productController")
const orderManagement = require("../controller/orderManagment")



// adminMiddler 
const {isAdmin} = require("../middlewares/adminMiddleware")

// get method render 
adminRouter.get("/logOut",isAdmin,adminController.logOut)
adminRouter.get("/userList",isAdmin,adminController.pageList)
adminRouter.patch("/isBlock:id",adminController.isBlock)     // user block admin

// catagorie controller render categories page
adminRouter.get("/editpage:id",isAdmin,adCatagoriescontrol.editCategoriePage)
adminRouter.get("/catagories",isAdmin,adCatagoriescontrol.categoriesPage)
adminRouter.get("/add-category",isAdmin,adCatagoriescontrol.addCotegoriesPage)
adminRouter.post("/addCategory",isAdmin,uploadImage.any(),adCatagoriescontrol.addCotegories)
adminRouter.post("/updateCatogory:id",isAdmin,uploadImage.any(),adCatagoriescontrol.updateCatagory)
adminRouter.patch("/listCategories:id",isAdmin,adCatagoriescontrol.listCategories)
adminRouter.patch("/unListCategories:id",isAdmin,adCatagoriescontrol.unListCategories)
adminRouter.delete("/deletIng:id",isAdmin,adCatagoriescontrol.deletIng)


// productPage controller

adminRouter.get("/productPage",isAdmin,adminProduct.productPage)
adminRouter.get("/addProduct",isAdmin,adminProduct.addProduct)  // rendeerAddProduct page
adminRouter.post("/addProductData",isAdmin,uploadImage.any(),adminProduct.addProductData)
adminRouter.post("/editProductData:id",isAdmin,uploadImage.any(),adminProduct.editProduct)
adminRouter.get("/productEdit:id",isAdmin,adminProduct.productEdit)
adminRouter.delete("/deletProduct:id",isAdmin,adminProduct.deletIngProduct)
adminRouter.patch("/list/:id",isAdmin,adminProduct.listProduct)
adminRouter.patch("/unlist/:id",isAdmin,adminProduct.unListProduct)



// admin logout


adminRouter.get("/adminlogut",isAdmin,adminController.logOut)


// admin order Management

adminRouter.get("/orderManagment",isAdmin,orderManagement.orderManagement)
adminRouter.get("/adminOrder/orderStatus:id",isAdmin,orderManagement.orderStatus)


//product status 

adminRouter.get("/orderManagement/status:id",isAdmin,orderManagement.updateOrderStatus)
module.exports = adminRouter