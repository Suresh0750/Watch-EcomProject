
const express = require("express")

const adminRouter = express.Router()

const axios =  require("axios")

const  uploadImage = require("../helper/multer")


const adminController = require("../controller/adminController")
const adCatagoriescontrol = require("../controller/adminCatogoricontroller")
const adminProduct = require("../controller/productController")
const orderManagement = require("../controller/orderManagment")
const {Coupons,addCoupon,editCoupon,deleteCoupon} = require("../controller/couponManagement")
const {salesReport,salesReportDownload,salesReportFilterCustom,salesReportDownloadPDF,salesReportFilter} = require("../controller/salesReportController")
const {productOfferManagement,addOffer,editOffer,getCategoryOffer,addCategoryOffer,editCategoryOffer,editCategoryOfferStatus} = require("../controller/offerControl")


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
adminRouter.get("/orderManagement/status:id",isAdmin,orderManagement.updateOrderStatus)     //*product status 


//* Coupons Mangement

adminRouter.get("/Coupons",isAdmin,Coupons)
adminRouter.post("/couponManagement/addCoupon",isAdmin,addCoupon)
adminRouter.put("/couponManagement/editCoupon/:id",isAdmin,editCoupon)
adminRouter.delete("/couponManagement/deleteCoupon/:id",isAdmin,deleteCoupon)




//*salesReport download/xlsx

adminRouter.get("/salesReport/download/xlsx",isAdmin,salesReportDownload);
adminRouter.post("/salesReport/filterCustom",salesReportFilterCustom)
adminRouter.get("/salesReport/download/pdf",isAdmin,salesReportDownloadPDF)
adminRouter.post("/salesReport/filter",salesReportFilter)
//* salesReport
adminRouter.get("/salesReport",isAdmin,salesReport)




//* productOfferManagement
adminRouter.get("/productOfferManagement",isAdmin,productOfferManagement)
adminRouter.post("/productOfferManagement/addOffer",isAdmin,addOffer)
adminRouter.put("/productOfferManagement/editOffer/:id",isAdmin,editOffer)



//* category offerManagement

adminRouter.get("/category-offer-list",isAdmin,getCategoryOffer)
adminRouter.post("/add-category-offer",isAdmin,addCategoryOffer)
adminRouter.put("/edit-category-offer",isAdmin,editCategoryOffer)
adminRouter.get("/categoryoffer-status/:id",isAdmin,editCategoryOfferStatus)


// admin. dashboardData
adminRouter.get("/dashboardData",isAdmin,adminController.dashboardData)
module.exports = adminRouter