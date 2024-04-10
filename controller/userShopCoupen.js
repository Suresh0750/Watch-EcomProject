const coupenModel = require("../models/couponModel")

const allProductCoupen = async (req,res)=>{

    try{
        

        const userId = req.session?.userIsthere?.userId
        
        const coupenCheck = await coupenModel.findOne({couponCode:(req.body?.userCoupen).trim()})
       
        
        const coupenUserexist = coupenCheck?.userId?.includes(userId)
       
        if(!coupenUserexist){
           const applyCoupen =  await coupenModel.findByIdAndUpdate({_id:coupenCheck._id},{$push:{userId:userId}})
           
           const grandTotal  =   Math.round(Number(req.session?.grandTotal)-((Number(applyCoupen?.discountPercentage)/100)*Number(req.session?.grandTotal)))
           req.session.coupen = grandTotal
           req.session.save()
        
            res.status(200).send({success:true})
        }else{
            res.json({success:false,coupenExist:true})
        }
     

    }catch(err){
        res.status(501).send({success:false})
        console.log(`Error from allProductCoupen `)
    }

}



module.exports = {allProductCoupen}