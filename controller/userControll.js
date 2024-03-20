
const userCollection = require("../models/userModel")
const {AddressModel} = require("../models/addressModel")
const {emailOtp} = require("./authController")
const orderData = require("../models/orderModel")
const bcrypt = require("bcrypt")
const walletModel = require("../models/WalletModel")



//* wallet

const wallet =  async (req,res)=>{
    try{

        console.log(`req reached wllet`)

        const userId = req.session.userIsthere.userId

        const userDetail = await userCollection.findById({_id:userId})

        const userWallet = await walletModel.findOne({userId:userId}) 
        console.log(userDetail)
        console.log(userWallet)
        const walletBalance = userWallet?.walletBalance ?? 0
        res.render("user/wallet",{isAlive:req.session.userIsthere,userDetail,walletBalance})

    }catch(err){

        console.log(`Error from wallet page`)
    }
}

//returnOrder

const returnOrder = async (req,res)=>{

    try{

        console.log(req.body)

        const id = req.body.orderId
        const price = req.body.price
        const orderRetrun =  await orderData.findByIdAndUpdate({_id:id},{orderStatus:"Return"})


        const userId = req.session.userIsthere.userId
        console.log(userId)
        const userWallet = await walletModel.findOne({userId:userId})

        console.log("userWallet\n",userWallet)

        if(userWallet){
            console.log(`==========`)
            const transactionAmount = orderRetrun.grandTotalCost
            const transactionType = orderRetrun.paymentType

            const returnAmount ={
                transactionAmount:transactionAmount,
                transactionType,transactionType
            }

           const pushOrder = await walletModel.findByIdAndUpdate({_id:userWallet._id},{$push:{walletTransaction:returnAmount}})

            const walletBalance = await walletModel.findById({_id:pushOrder._id})

            let balance =0
            walletBalance.walletTransaction.forEach((val)=>{
                
                balance+=val.transactionAmount
               
            })

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



// user cancel the order

const cancelorder = async (req,res)=>{

    try{

        console.log(req.method)
        console.log(req.body)

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
        
        res.render("user/single-order",{isAlive:req.session.userIsthere,order:orderDetail,user})
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



        res.render("user/userOrder",{isAlive:req.session.userIsthere,orderDetails,count,limit,page})

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
        res.render("user/userOTP",{isAlive:req.session.userIsthere,isWrongOtp:req.session.isWrongOtp})
        req.session.isWrongOtp = false
    }catch(err){

        console.log(`Error fron userOTPpage ${err}`)
    }
}



// editAndUpdateuserProfile 


const editAndUpdateProfile = async(req,res)=>{
    try{

        const {userId,userEmail,lastName,firstName:userMobile} = req.body

    
        req.session.userIsthere.userName = req.body.firstName
        req.session.save()
        const userDetail = await userCollection.findById({_id:userId})

        if(userEmail === userDetail.userEmail){
           
            await userCollection.findByIdAndUpdate({_id:userId},{firstName:req.body.firstName,lastName:req.body.lastName,userMobile:req.body.userMobile,userEmail:req.body.userEmail})
    
            res.status(200).send({success:true,otp:false})
        }else{

           const emailIsthere = await userCollection.findOne({userEmail:req.body.userEmail})

        

           if(!emailIsthere){

          
            const profileEditOTP = await emailOtp(req.body.userEmail)

            // req.session.forGetEmail = req.body.userEmail
            req.session.forGetEmail = req.body
            req.session.otp = profileEditOTP

            req.session.save()
            res.status(200).send({success:true,otp:true})
             
           }

           res.status(501).send({sucess:false})
        }

        


    }catch(err){

        console.log(`Error from editAndUpdateProfile ${err}`)
    }
}

// edit Profile is rendered


const editProfile = async(req, res)=>{

    try{
        const id = req.params.id
        const profileDetails = await userCollection.findOne({_id:id})
        
        res.render("user/editProfile",{isAlive:req.session.userIsthere,profileDetails})
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
  
        res.render("user/changePassUser",{userId})

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
        res.render("user/editAddress",{isAlive:req.session.userIsthere,address})

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

        res.render("user/myAddress",{isAlive:req.session.userIsthere,userAddress})


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

        res.render("user/addAddress",{isAlive:req.session.userIsthere})

    }catch(err){

        console.log(`Error from addAddress function ${err}`)
    }
}



// show profile
const profile = async (req,res)=>{

    try{
        const profileDetails = await userCollection.findOne({_id:req.session.userIsthere.userId})

        res.render("user/profile",{isAlive:req.session.userIsthere,profileDetails})
    }catch(err){


        console.log(`Error from  profile function\n${err}`)

    }

}


module.exports = {
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
    editAddress, // edite Address page render
    daleteAdd,
    myAddress,
    addAddressData,
    profile,
    addAddress}