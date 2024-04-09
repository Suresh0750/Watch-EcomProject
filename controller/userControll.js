
const userCollection = require("../models/userModel")
const {AddressModel} = require("../models/addressModel")
const {emailOtp} = require("./authController")
const orderData = require("../models/orderModel")
const bcrypt = require("bcrypt")
const walletModel = require("../models/WalletModel")
const productCollection = require("../models/productModel")
const { generatevoice } = require("../service/genertePDF.js");
const whishlistCollection = require("../models/whislistModel")
const cartCollection = require("../models/cartModel")

//*downloadInvoice

const downloadInvoice = async (req, res) => {
    try {
        console.log(`req reached downloadInvoice`)
        console.log(req.params.id)
      let orderDatails = await orderData
        .findOne({ _id: req.params.id })
        .populate("addressChosen");
    
      const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment;filename=invoice.pdf",
      });
      console.log("verind");
      generatevoice(
        (chunk) => stream.write(chunk),
        () => stream.end(),
        orderDatails
      );
      console.log(generatevoice);
    } catch (error) {
      console.error(error);
    }
  };


//* wallet

const wallet =  async (req,res)=>{
    try{

        console.log(`req reached wllet`)

        const userId = req.session.userIsthere.userId

        const userDetail = await userCollection.findById({_id:userId})

        const userWallet = await walletModel.findOne({userId:userId}) 

        
      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

      }else{

         NofWhilist = 0

      }

        console.log(userDetail)
        console.log(userWallet)
        const walletBalance = userWallet?.walletBalance ?? 0
        res.render("user/wallet",{isAlive:req.session.userIsthere,userDetail,walletBalance,NofWhilist})

    }catch(err){

        console.log(`Error from wallet page`)
    }
}



async function returnProductIncproductStock(productReturn){



    console.log(`enter that function returnProductIncproductStock`)
    console.log(productReturn)

    console.log(JSON.stringify(productReturn))

    //* after user want to return any product I Increase product stock and decrease productSold out 

 const updateAfterReturnProduct =   await productReturn.cartData.forEach(async(data)=>{
        
                                    await productCollection.findByIdAndUpdate({_id:data.productId._id},{$inc:{productStock:data.productQuantity,productSold:-data.productQuantity}})
                           
                                })
}

//returnOrder

const returnOrder = async (req,res)=>{

    try{

        console.log(req.body)

        const id = req.body.orderId
        const price = req.body.price
        const orderRetrun =  await orderData.findByIdAndUpdate({_id:id},{orderStatus:"Return"})

        


        returnProductIncproductStock(orderRetrun)              // return product 


        const userId = req.session.userIsthere.userId
        console.log(userId)
        const userWallet = await walletModel.findOne({userId:userId})

       

        if(userWallet){
            

            let amount = 0
            orderRetrun.cartData.forEach(async(val)=>{

                if(val.singleOrderstatus !="Cancelled" && val.singleOrderstatus != "Return"){

                    amount+=val.totalCastPerproduct
                }

                await orderData.updateOne({"cartData._id":val._id},{$set:{"cartData.$.singleOrderstatus":"Return"}})   //* single order update "Redurn" for showing the user 

            })
            
            const transactionType = orderRetrun.paymentType

            const returnAmount ={
                transactionAmount:amount,
                transactionType :transactionType,
                message:"order-Retrun"
            }

           const pushOrder = await walletModel.findByIdAndUpdate({_id:userWallet._id},{$push:{walletTransaction:returnAmount}})

            const walletBalance = await walletModel.findById({_id:pushOrder._id})

            let balance =0
            walletBalance.walletTransaction.forEach((val)=>{
                
                balance+=val.transactionAmount
               
            })
            let decBalance = 0
            walletBalance.NewTransaction.forEach((val)=>{

                decBalance+=Number(val.transactionAmount) 

            }) 
            balance-=decBalance
            await walletModel.findByIdAndUpdate({_id:userWallet._id},{walletBalance:balance})
            res.status(200).send({success:true})

        }else{

            const userWallet = {
                userId:userId,
                walletBalance:price,
                walletTransaction:[
                    {       
                        transactionAmount:price,
                    }
                ]
            }

        await new  walletModel(userWallet).save()

        }
        
        res.status(200).send({success:true})

    }catch(err){

        console.log(`Error from returnOrder ${err}`)
    }
}

//* singleOrderCancel

const singleOrderCancel = async(req,res)=>{
    try{

        console.log(`req reached singleOrderCancel`)

        console.log(req.body)

        const order = await orderData.findById({_id:req.body.orderId})

        await orderData.updateOne({"cartData._id":req.body.singleOrderId},{$set:{"cartData.$.singleOrderstatus":"Cancelled"}})   //* single order cancel 




        // * if every single product order cancell we want to update main order cancell

        const orderStatusUpdate = await orderData.findById({_id:req.body.orderId})

        const cartLength = (orderStatusUpdate.cartData).length

        let count = 0 
        orderStatusUpdate.cartData.forEach((val)=>{

            if(val.singleOrderstatus == "Cancelled"){

                count++

            }

        })

        if(count == cartLength){


            await orderData.updateOne({_id:req.body.orderId},{$set:{orderStatus:"Cancelled"}})

        }



        let singleOrderId = req.body.singleOrderId

        const userId = req.session?.userIsthere?.userId

       // * update single order amount to the wallet 
        let paymentType = order.paymentType
       if( paymentType !== "Cash on Delivery"){

           order.cartData.forEach(async (val)=>{
               
               if(val._id == singleOrderId){
                   
               let amount = val.totalCastPerproduct
   
               let storeWalletTransaction = {
                   transactionAmount :amount,
                   transactionType : paymentType,
                   message : "Singleorder-Cancelled"
               }
               
                await walletModel.updateOne(
                           { userId:userId },
                           {
                           $push: {
                               walletTransaction: storeWalletTransaction
                           },
                           $inc: { walletBalance: amount } // Assuming 'balance' is the numeric field you want to increment
                           }
                       )
                 
   
               }
           })

       }

        console.log(JSON.stringify(order))
        
        res.status(200).send({success:true})

    }catch (err){

        res.status(500).send({success:false})
        console.log(`Error from singleOrderCancel router ${err}`)
    }
}


const singleOrderReturn = async(req,res)=>{

    try{
        console.log(`req reached cancelorder`)

        const singleOrderId = req.body.singleOrderId 
        console.log(singleOrderId)

        const orderDetails = await orderData.findById({_id:req.body.orderId})

        let amount;
        orderDetails.cartData.forEach(async(val)=>{

            if(val._id == singleOrderId ){
                        
                amount = val.totalCastPerproduct
                await orderData.updateOne({"cartData._id":val._id},{$set:{"cartData.$.singleOrderstatus":"Return"}})   //* single order cancel 
                
            }

        })

        let storeWalletTransaction = {
            transactionAmount :amount,
            transactionType : orderDetails.paymentType,
            message : "singleOrder-Retrun"
        }
        
         await walletModel.updateOne(
                    { userId:orderDetails.userId },
                    {
                    $push: {
                        walletTransaction: storeWalletTransaction
                    },
                    $inc: { walletBalance: amount } // Assuming 'balance' is the numeric field you want to increment
                    }
                )
        
        res.status(200).send({success:true})

    }catch(err){

        res.status(500).send({success:false})
        console.log(`Error from singleOrderReturn`)

    }
}

// user cancel the order

const cancelorder = async (req,res)=>{

    try{

        console.log(`req reached cancelorder`)

        let orderProduct = await orderData.findById({_id:req.body.orderId})

        console.log(JSON.stringify(orderProduct))

        if(orderProduct.paymentType == "Razorpay" || orderProduct.paymentType == "Wallet"){

            let amount = 0
            orderProduct.cartData.forEach(async (val)=>{
                    
                    if(val.singleOrderstatus == "Pending"){
                        
                        amount+=val.totalCastPerproduct

                        await orderData.updateOne({"cartData._id":val._id},{$set:{"cartData.$.singleOrderstatus":"Cancelled"}})   //* single order cancel 
                        
                    }
                })

        //    await walletModel.updateOne({userId:orderProduct.userId},{$inc:{walletBalance:amount}})

           let storeWalletTransaction = {
            transactionAmount :amount,
            transactionType : orderProduct.paymentType,
            message : "order-Cancelled"
        }
        
         await walletModel.updateOne(
                    { userId:orderProduct.userId },
                    {
                    $push: {
                        walletTransaction: storeWalletTransaction
                    },
                    $inc: { walletBalance: amount } // Assuming 'balance' is the numeric field you want to increment
                    }
                )
        }

        await orderData.findByIdAndUpdate({_id:req.body.orderId},{orderStatus:"Cancelled"})

        res.status(200).send({success:true})

    }catch (err){
        console.log(`Error from cancelorder ${err}`)
    }
}

//orderDetails show user

const orderDetails = async (req,res)=>{

    try{
        const id = req.params.id

        const orderDetail = await  orderData.findById({_id:id}).populate("addressChosen")
   
        const user = await userCollection.findById({_id:orderDetail.userId})
        
        
      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

      }else{

         NofWhilist = 0

      }

        res.render("user/single-order",{isAlive:req.session.userIsthere,order:orderDetail,user,NofWhilist})
    }catch(err){
        console.log(`Error from orderDetails ${err}`)
    }
}



//user allOrders

const allOrders = async(req,res)=>{

    try{
       
        let count;
        let limit = 5
        let skip;
        let page = req.query?.page || 1 ;
        
        skip = (page-1)*limit
        const userId = req.session?.userIsthere?.userId
      
        const orderDetails = await orderData.find({userId:userId}).skip(skip).limit(limit)
        count = await orderData.find({userId:userId}).countDocuments()


        let NofWhilist 

        if(req.session.userIsthere){
  
         NofWhilist = await cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0
  

        }else{
  
           NofWhilist = 0
  
        }

        res.render("user/userOrder",{isAlive:req.session.userIsthere,orderDetails,count,limit,page,NofWhilist})

    }catch(err){
        console.log(`Error form allOrders ${err} `)
    }
}

//userOtpValue verify 

const userOtpValue = async (req,res)=>{


    try{

        const userEnterOTP = Number(req.body.OtpNum)
        const gentrateOTP = Number(req.session.otp)

        if(userEnterOTP ===  gentrateOTP){

            const isUser = req.session.userIsthere

            const userChange = req.session.forGetEmail
            await userCollection.findByIdAndUpdate({_id:isUser.userId},{$set:{firstName:userChange.firstName,lastName:userChange.lastName,userMobile:userChange.userMobile,userEmail:userChange.userEmail}})
            res.status(200).send({success:true})

        }

        res.status(500).send({success:false})
    }catch(err){
        console.log(`Error from userOtpValue ${err}`)
    }
}

// userOTPpage rendered 

const userOTPpage = async (req,res)=>{

    try{
        req.session.isWrongOtp;

        
      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

      }else{

         NofWhilist = 0

      }

        res.render("user/userOTP",{isAlive:req.session.userIsthere,isWrongOtp:req.session.isWrongOtp,NofWhilist})
        req.session.isWrongOtp = false
    }catch(err){

        console.log(`Error fron userOTPpage ${err}`)
    }
}



// editAndUpdateuserProfile 


const editAndUpdateProfile = async(req,res)=>{
    try{

        console.log(`req reached editAndUpdateProfile`)

        console.log(req.body)
        console.log(req.body.userEmail)

        const {userId,userEmail,lastName,firstName:userMobile} = req.body

    
        req.session.userIsthere.userName = req.body.firstName
        req.session.save()
        const userDetail = await userCollection.findById({_id:userId})

       

           
        let userData =     await userCollection.findByIdAndUpdate({_id:userId},{firstName:req.body.firstName,lastName:req.body.lastName,userMobile:req.body.userMobile,userEmail:userDetail.userEmail})
    
        console.log(userData)
            res.status(200).send({success:true,otp:false})
       
        


    }catch(err){

        console.log(`Error from editAndUpdateProfile ${err}`)
    }
}

// edit Profile is rendered


const editProfile = async(req, res)=>{

    try{
        const id = req.params.id
        const profileDetails = await userCollection.findOne({_id:id})

        
      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

      }else{

         NofWhilist = 0

      }

        
        res.render("user/editProfile",{isAlive:req.session.userIsthere,profileDetails,NofWhilist})
    }catch(err){

        console.log(`Error from editProfile function ${err}`)
    }
}

// userPassword change 

const updateUserPass = async(req,res)=>{

    try{

        const user = req.body

        const userDetail = await userCollection.findOne({_id:user.id})

        const passMatch = await bcrypt.compare(user.currentPass,userDetail.userPassword)

      

        if(passMatch)
        {
            const newPass = user.newPass
            const passwordDcrypt = await bcrypt.hash(newPass,10)
            
            await userCollection.findByIdAndUpdate({_id:user.id},{userPassword:passwordDcrypt})
            
            res.status(200).send({success:true})
        }else{

            res.status(501).send({success:false,pass:false})
        }

        
    }catch(err){
        res.status(501).send({success:false})
        console.log(`Error from updateUserPass ${err}`)
    }
}


// change password page render
const changePassword = async (req,res)=>{
    try{
        const {userId} = req.session.userIsthere
  
        
      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

      }else{

         NofWhilist = 0

      }

        res.render("user/changePassUser",{userId,NofWhilist})

    }catch(err){
        console.log(`Error from changePassword ${err}`)
    }
}

// edit Address update data

const editUserData = async (req,res)=>{

    try{

        const {_id} = req.body
       
        await AddressModel.findByIdAndUpdate({_id:_id},{$set:{name:req.body.name,phone:req.body.phone,houseNo:req.body.houseNo,state:req.body.state,city:req.body.city,pincode:req.body.pincode}})

        res.status(200).send({success:true})

    }catch(err){
        res.status(500).send({success:false})
        console.log(`Error from editUserData ${err}`)
    }

}
// editAddress user side render

const editAddress = async (req,res)=>{

    try{
        const id= req.params.id
        const address = await AddressModel.findOne({_id:id})

        
      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

      }else{

         NofWhilist = 0

      }

        res.render("user/editAddress",{isAlive:req.session.userIsthere,address,NofWhilist})

    }catch(err){
        console.log(`Error from editAddress ${err}`)
    }
}
// delet Address


const daleteAdd = async (req,res)=>{
    try{

        const id = req.params.id

        await AddressModel.findByIdAndDelete({_id:id})
        
        res.status(200).send({success:true})

    }catch(err){

        res.status(500).send({success:false})
        console.log(`Error from data`)

    }
}


// render my address Page

const myAddress = async (req,res)=>{
    try{

        const {userId} = req.session.userIsthere

        const userAddress = await  AddressModel.find({user_id:userId})

        
      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

      }else{

         NofWhilist = 0

      }

        res.render("user/myAddress",{isAlive:req.session.userIsthere,userAddress,NofWhilist})


    }catch(err){
        console.log(`Error from my Address\n ${err}`)
    }
}

const addAddressData = async (req,res)=>{

    try{


        const {userId} = req.session.userIsthere

        const newAddress = {
            user_id:userId,
            name : req.body.userName,
            phone : req.body.userMobile,
            houseNo : req.body.houseNo,
            state : req.body.state,
            city : req.body.city,
            pincode : req.body.pincode
        }
       
        await AddressModel(newAddress).save()

        res.redirect("/user/myAddress")


    }catch(err){
        console.log(`Error from addAddressData ${err}`)
    }
}



// addProfile


const addAddress = async (req,res)=>{

    try{
        
      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

      }else{

         NofWhilist = 0

      }

        res.render("user/addAddress",{isAlive:req.session.userIsthere,NofWhilist})

    }catch(err){

        console.log(`Error from addAddress function ${err}`)
    }
}



// show profile
const profile = async (req,res)=>{

    try{
        console.log(`req reached profile controller`)
        console.log(req.session)
        console.log(req.session.userIsthere)
        const profileDetails = await userCollection.findOne({_id:req.session?.userIsthere?.userId})
        console.log(profileDetails)
        
      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

      }else{

         NofWhilist = 0

      }

        res.render("user/profile",{isAlive:req.session.userIsthere,profileDetails,NofWhilist})
    }catch(err){


        console.log(`Error from  profile function\n${err}`)

    }

}


module.exports = {
    singleOrderReturn,
    singleOrderCancel,          //* singleOrderCancel cancel
    downloadInvoice,
    wallet,                     //wallet
    returnOrder,                // returnOrder 
    cancelorder,                //
    orderDetails,               // orderDetails view order for user
    allOrders,                  // all orders 
    userOtpValue ,              //  verfy the otp for user profile update new email
    userOTPpage,                // userOTPpage rendered
    editAndUpdateProfile,       //editAndUpdateProfile
    editProfile,        // edit Page rendered
    updateUserPass,   // userPassword change
    changePassword,     // changPassword page render
    editUserData,
    editAddress,        // edite Address page render
    daleteAdd,
    myAddress,
    addAddressData,
    profile,
    addAddress}