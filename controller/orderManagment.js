const orderCollection = require("../models/orderModel")




// orderStatuS update


const updateOrderStatus = async (req,res)=>{

    try{

        const idwithStatus = req.params.id

        const id=idwithStatus.slice(1)

        const statusIdentify = idwithStatus[0]

        if(statusIdentify === "P"){

            await orderCollection.findByIdAndUpdate({_id:id},{orderStatus:"Pending"})
            
            res.redirect("/admin/orderManagment")
        }else if(statusIdentify === "S" ){
            await orderCollection.findByIdAndUpdate({_id:id},{orderStatus:"Shipped"})
            
            res.redirect("/admin/orderManagment")

        }else if(statusIdentify === "D"){
            await orderCollection.findByIdAndUpdate({_id:id},{orderStatus:"Delivered"})
            
            res.redirect("/admin/orderManagment")

        }else if(statusIdentify === "R"){

            await orderCollection.findByIdAndUpdate({_id:id},{orderStatus:"Return"})
            
            res.redirect("/admin/orderManagment")


        }else if(statusIdentify === "C"){
            await orderCollection.findByIdAndUpdate({_id:id},{orderStatus:"Cancelled"})
            
            res.redirect("/admin/orderManagment")

        }

        

    }catch (err){
        console.log(`Error fron updateOrderStatus ${err}`)
    }
}


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
    updateOrderStatus,          // update order status pending , shiped , deliverd
    orderStatus,
    orderManagement,
}