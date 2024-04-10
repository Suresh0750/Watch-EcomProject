
const productOfferCollection = require("../models/productOfferModel")
const productCollection = require("../models/productModel")
const categoryModel = require("../models/categoriesModel")
const applyProductOffers = require("../service/applyProductOffers").applyProductOffer
const formatDate = require("../service/formatDateHelper");
const categoryOfferModel = require("../models/categoryOfferModel")
const applyCategoryOffer= require("../service/applyCategoryOffer").applyCategoryOffer;

//** == categoryOffersManagement   == **/


const editCategoryOfferStatus = async (req, res) => {
                try {
                  const { id } = req.params;
                  const offer = await categoryOfferModel.findOne({ _id: id });
                  if (offer?.isAvailable) {
                    await categoryOfferModel.findByIdAndUpdate(id, {
                      isAvailable: false,
                    });
                  } else {
                    await categoryOfferModel.findByIdAndUpdate(id, {
                      isAvailable: true,
                    });
                  }
                  res.redirect("/admin/category-offer-list");
                } catch (error) {
                  console.log(error);
                }
              }

const editCategoryOffer = async (req, res) => {
            try {
              const { id, offerPercentage, startDate, endDate } = req.body;

              const offer = await categoryOfferModel.findByIdAndUpdate(id, {
                offerPercentage,
                startDate,
                endDate,
              });

              return res.status(200).send({ success: true });
            } catch (error) {
              console.log(error);
              return res.status(500).send({ success: false });
            }
          }

const  addCategoryOffer = async (req, res) => {
              try {
              
                const { category, offerPercentage, startDate, endDate } = req.body;
           
                const offerExist = await categoryOfferModel.findOne({ category });


                if (offerExist) {
                  return res.status(500).send({ exist: true });
                }

                const offer = await new categoryOfferModel({
                  category,
                  offerPercentage,
                  startDate,
                  endDate,
                }).save();

                return res.status(200).send({ success: true });
              } catch (error) {
                console.log(`error from addCategoryOffer ${error}`);
                return res.status(500).send({ success: false });
              }
            }



//* categoryPage render

const getCategoryOffer = async (req, res) => {
              try {
              
                const categories = await categoryModel.find();
             
                const offers = await categoryOfferModel.find().populate("category");
         
                applyCategoryOffer();
                res.render("Admin/categoryOfferList", { categories, offers });
              } catch (error) {
                console.log(error);
              }
            }

//*==========================================================*//

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

const   addOffer = async (req, res) => {
                 try {
                 
                    //check if the product already has an offer applied
                    let { productName } = req.body;

                    let existingOffer = await productOfferCollection.findOne({ productName });

                 
                    if (!existingOffer) {
                        //if offer for that particular product doesn't exist:
            
                        let product = req.body?.productName
                        let productData = await productCollection.findOne({productName:product});

                       
                        let { productOfferPercentage, startDate, endDate } = req.body;
                         
                        await productOfferCollection.insertMany([
                        {
                            productId: productData._id,
                            productName,
                            productOfferPercentage,
                            startDate: new Date(startDate),
                            endDate: new Date(endDate),
                        },
                        ]);
                        
                        await applyProductOffers("addOffer");
                       
                        res.json({ success: true });
                    } else {
                        res.json({ success: false });
                    }
                    } catch (error) {
                    console.error(error);
                    }

                }


const editOffer = async (req,res)=>{

    try {

        
        let { productName } = req.body;
        let existingOffer = await productOfferCollection.findOne({
          productName: { $regex: new RegExp(req.body.productName, "i") },
        });
  
        if (!existingOffer || existingOffer._id == req.params.id) {
        
        
          let { discountPercentage, startDate, expiryDate } = req.body;
          
          let updateFields = {
           productName,
           productOfferPercentage:Number( discountPercentage),
            startDate: new Date(startDate),
            endDate:new Date(expiryDate),
          };
   
        
          const hhh=await productOfferCollection.findByIdAndUpdate(
            req.params.id,
            updateFields
          );
          
          await applyProductOffers("editOffer");
          res.json({ success: true });
        } else {
          
          res.json({ success: false });
        }
      } catch (error) {
        console.error(error);
      }

}

module.exports =  {productOfferManagement,addOffer,editOffer,getCategoryOffer,addCategoryOffer,editCategoryOffer,editCategoryOfferStatus}