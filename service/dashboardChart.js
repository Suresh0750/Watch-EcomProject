const categoryCollection =  require("../models/categoriesModel")
const orderCollection = require("../models/orderModel")
const productCollection = require("../models/productModel")



const productsCount = async () => {
    try {
      return await productCollection.countDocuments();
    } catch (error) {
      console.error(error);
    }
  };
  
  const categoryCount = async () => {
    try {
      return await categoryCollection.countDocuments();
    } catch (error) {
      console.error(error);
    }
  };
  const pendingOrdersCount = async () => {
    try {
      return await orderCollection.countDocuments({
        orderStatus: { $ne: "Delivered" },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const shipping = async () => {
    try {
      return await orderCollection.countDocuments({ orderStatus: "Shipped" });
    } catch (error) {
      console.error(error);
    }
  };
  
  const completedOrdersCount = async () => {
    try {
      return await orderCollection.countDocuments({ orderStatus: "Delivered" });
    } catch (error) {
      console.error(error);
    }
  };


  const currentDayRevenue = async () => {
    try {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
  
      const result = await orderCollection.aggregate([
        { $match: { orderDate: { $gte: yesterday, $lt: today } } },
        { $group: { _id: "", totalRevenue: { $sum: "$grandTotalCost" } } },
      ]);
      return result.length > 0 ? result[0].totalRevenue : 0;
    } catch (error) {
      console.error(error);
    }
  };
  
  module.exports ={productsCount,categoryCount,pendingOrdersCount,shipping,completedOrdersCount,currentDayRevenue}