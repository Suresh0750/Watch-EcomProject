const orderCollection = require("../models/orderModel")

//orderStatus

const orderStatus = async (req,res)=>{

    try{


        console.log(`req reached orderStatus`)

        const id = req.params.id

        const orderData = await orderCollection.findById({_id:id}).populate("addressChosen")




        res.render("admin/orderStatus",{orderData})
        
    }catch (err){
        console.log(`Error from orderStatus ${err}`)
    }
}

// orderManagement rendered

const orderManagement = async (req,res)=>{

    try{

        console.log(`req reached orderManagement `)
        let count;
        let skip;
        let limit =5;
        let OrderDetails;
        let page = Number(req.query.page) || 1
        skip = (page-1)*limit
         OrderDetails = await orderCollection.find({}).skip(skip).limit(limit)

         count = await orderCollection.find({}).countDocuments()
        console.log(OrderDetails)
        res.render("admin/orderManagment",{OrderDetails,count,limit})

    }catch(err){

        console.log(`Error from orderManagment ${err}`)
    }
}


module.exports = {
    orderStatus,
    orderManagement,
}