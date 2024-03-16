
const orderCollection =  require("../models/orderModel")


const salesReport = async (req, res) => {
    try {
    //   if (req.session?.admin?.salesData) {
    //     let { salesData, dateValues } = req.session.admin;
    //     return res.render("Admin/salesReport", { salesData, dateValues });
    //   }
  
      let page = Number(req.query.page) || 1;
      let limit = 10;
      let skip = (page - 1) * limit;
  
      let count = await orderCollection.countDocuments()
  
      let salesData = await orderCollection
        .find({ orderStatus: "Delivered" }) 
        .populate("userId")
        .skip(skip)
        .limit(limit);
  
        
  
      console.log("lllllll",salesData);
      res.render("Admin/salesReport", {
        salesData,
        dateValues: null,
        count,
        limit,
        page,
      });
    } catch (error) {
      console.error(error);
    }
  };

module.exports = {salesReport}