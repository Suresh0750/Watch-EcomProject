
const productOfferCollection = require("../models/productOfferModel")
const productCollection = require("../models/productModule")
const categoryModel = require("../models/categoriesModel")
//productOfferManagement

const productOfferManagement = async (req,res)=>{
   
        try {
          // updating the currentStatus field by checking with the current date
          let productOfferData = await productOfferCollection.find();
          productOfferData.forEach(async (v) => {
            await productOfferCollection.updateOne(
              { _id: v._id },
              {
                $set: {
                  currentStatus:
                    v.endDate >= new Date() && v.startDate <= new Date(),
                },
              }
            );
          });
    
          //sending the formatted date to the page
          productOfferData = productOfferData.map((v) => {
            v.startDateFormatted = formatDate(v.startDate, "YYYY-MM-DD");
            v.endDateFormatted = formatDate(v.endDate, "YYYY-MM-DD");
            return v;
          });
    
          let productData = await productCollection.find();
          let categoryData = await categoryModel.find();
    
          res.render("Admin/productOfferList", {
            productData,
            productOfferData,
            categoryData,
    
          });
        } catch (error) {
          console.error(error);
        }
      
}


module.exports =  {productOfferManagement}