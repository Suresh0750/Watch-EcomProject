const coupenModel = require("../models/couponModel")

const allProductCoupen = async (req,res)=>{

    try{
        console.log(`req reached allProductCoupen`)
        console.log(req.body)

        const userId = req.session?.userIsthere?.userId
        console.log(req.session)
        const coupenCheck = await coupenModel.findOne({couponCode:(req.body?.userCoupen).trim()})
        console.log(coupenCheck)
        console.log(JSON.stringify(coupenCheck))
        const coupenUserexist = coupenCheck?.userId?.includes(userId)
        console.log(coupenUserexist)
        if(!coupenUserexist){
           const applyCoupen =  await coupenModel.findByIdAndUpdate({_id:coupenCheck._id},{$push:{userId:userId}})
           console.log('**********')
           console.log(applyCoupen)
           console.log(req.session?.grandTotal)
           const grandTotal  = await (Number(applyCoupen.discountPercentage)/100)*Number(req.session?.grandTotal)
           req.session.coupen = grandTotal
           req.session.save()
           console.log(req.session?.grandTotal)
            res.status(200).send({success:true})
        }else{
            res.json({success:false,coupenExist:true})
        }
        console.log(coupenCheck)

    }catch(err){
        res.status(501).send({success:false})
        console.log(`Error from allProductCoupen `)
    }

}



module.exports = {allProductCoupen}