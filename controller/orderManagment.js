const orderCollection = require("../models/orderModel")




// orderStatuS update


const updateOrderStatus = async (req,res)=>{

    try{
        console.log(`req reached updateOrderStatus`)
        const idwithStatus = req.params.id

        const id=idwithStatus.slice(1)

        const orderDetails = await orderCollection.findOne({_id:id})

     
    if(orderDetails.orderStatus !== "Cancelled"){

        
        const statusIdentify = idwithStatus[0]

        if(statusIdentify === "P"){

          const orderData =  await orderCollection.findByIdAndUpdate({_id:id},{orderStatus:"Pending"})

          orderData.cartData.forEach(async(val)=>{          //* single order
            
            await orderCollection.updateOne({"cartData._id":val._id},{$set:{"cartData.$.singleOrderstatus":"Pending"}})

          })
            
            res.redirect("/admin/orderManagment")

        }else if(statusIdentify === "S" ){



            const orderData =  await orderCollection.findByIdAndUpdate({_id:id},{orderStatus:"Shipped"})

            orderData.cartData.forEach(async(val)=>{           //*single order
            
                await orderCollection.updateOne({"cartData._id":val._id},{$set:{"cartData.$.singleOrderstatus":"Shipped"}})
    
              })

            
            res.redirect("/admin/orderManagment")

        }else if(statusIdentify === "D"){

            const orderData =  await orderCollection.findByIdAndUpdate({_id:id},{orderStatus:"Delivered"})

            orderData.cartData.forEach(async(val)=>{           //*single order
            
                await orderCollection.updateOne({"cartData._id":val._id},{$set:{"cartData.$.singleOrderstatus":"Delivered"}})
    
              })

            
            res.redirect("/admin/orderManagment")

        }else if(statusIdentify === "R"){

            const orderData =  await orderCollection.findByIdAndUpdate({_id:id},{orderStatus:"Return"})
            
            orderData.cartData.forEach(async(val)=>{           //*single order
            
                await orderCollection.updateOne({"cartData._id":val._id},{$set:{"cartData.$.singleOrderstatus":"Return"}})
    
              })

            res.redirect("/admin/orderManagment")


        }else if(statusIdentify === "C"){

            const orderData =  await orderCollection.findByIdAndUpdate({_id:id},{orderStatus:"Cancelled"})

            orderData.cartData.forEach(async(val)=>{           //*single order
            
                await orderCollection.updateOne({"cartData._id":val._id},{$set:{"cartData.$.singleOrderstatus":"Cancelled"}})
    
              })

            
            res.redirect("/admin/orderManagment")

        }

    }else{
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




        res.render("Admin/orderStatus",{orderData})
        
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
       
        res.render("Admin/orderManagment",{OrderDetails,count,limit})

    }catch(err){

        console.log(`Error from orderManagment ${err}`)
    }
}


module.exports = {
    updateOrderStatus,          // update order status pending , shiped , deliverd
    orderStatus,
    orderManagement,
}