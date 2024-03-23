const productCollection = require("../models/productModel");
const productOfferCollection = require("../models/productOfferModel");
// const CategoryOfferModel = require("../models/categoryOfferModel");

module.exports = {
  applyProductOffer: async (from) => {
    try {
      console.log(`req reached applyProductOffer`)
      // updating the currentStatus field of productOfferCollection by checking with the current date
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

      let productData = await productCollection.find();
      productData.forEach(async (v) => {
        let offerExists = await productOfferCollection.findOne({
          productId: v._id,
          currentStatus: true,
        });

        if (offerExists) {
          offerExistsAndActiveFn(v, offerExists, from);
        }

        let offerExistsAndInactive = await productOfferCollection.findOne({
          productId: v._id,
          currentStatus: false,
        });

        if (offerExistsAndInactive) {
          offerExistsAndInactiveFn(v, from);
        }
      });
    } catch (error) {
      console.error(error);
    }
  },
};

async function offerExistsAndActiveFn(v, offerExists, from) {

  try{
    let { productOfferPercentage } = offerExists;

    let productPrice = await productCollection.findOne({_id:v})
    let productafterOfferPrice =Number(productPrice.productPrice)-(Number(productOfferPercentage)/100)*Number(productPrice.productPrice)
    if (from == "addOffer") {
      let productPrice = Math.round(
        v.productPrice * (1 - productOfferPercentage * 0.01)
      );
      await productCollection.updateOne(
        { _id: v._id },
        {
          $set: {
            productPrice,
            productOfferId: offerExists._id,
            productOfferPercentage,
            priceBeforeOffer: v.productPrice,
            productafterOfferPrice
          },
        }
      );
    } else if (from == "editOffer" || "landingPage") {
      let productPrice = Math.round(
        v.priceBeforeOffer * (1 - productOfferPercentage * 0.01)
      );
      await productCollection.updateOne(
        { _id: v._id },
        {
          $set: {
            productPrice,
            productOfferId: offerExists._id,
            productOfferPercentage,
          },
        }
      );
    }
  }catch(err){
    console.log(`service/applyProductoffers/offerExistsAndActiveFn\n ${err} `)
  }
}

async function offerExistsAndInactiveFn(v, from) {
  try{

    if (from == "editOffer" || "landingPage") {
      let productPrice = v.priceBeforeOffer;
      await productCollection.updateOne(
        { _id: v._id },
        {
          $set: {
            productPrice,
            productOfferId: null,
            productOfferPercentage: null,
          },
        }
      );
    }

  }catch(err){
    console.log(`Error from service/applyProductoffers/offerExistsAndInactiveFn\n ${err}`)
  }
 
}