const userdata = require("../models/userModel")
const bcrypt = require("bcrypt")
//nodemailer
const wallet = require('../models/WalletModel')

const nodemailer = require("nodemailer");
const productCollection = require("../models/productModel")
const whishlistCollection = require("../models/whislistModel")
const cartCollection = require("../models/cartModel")
const passport = require("passport")



const googleLogin = async(req,res)=>{
  try{

    const user = req.user.emails

    const userDetails = await userdata.findOne({userEmail:user[0].value})

    if(userDetails){

      if(userDetails?.isBlocked == true){
        req.session.isUserBlock = true
        req.session.isLoginFail = false
        req.session.save()
        res.redirect("/login")
      }
  
      if(userDetails && user[0].verified ){
  
        req.session.userIsthere = {
          isAlive:true,
          userName:userDetails.firstName,
          userId:userDetails._id
        }
  
        req.session.save()
        res.redirect("/")
    
      }else{
  
        req.session.isLoginFail = true,
        req.session.save()
        res.redirect("/login")
  
      }
    }else{

      
      req.session.isLoginFail = true,
      req.session.save()

      res.redirect("/login")
      
    }

    

  }catch(err){
    console.log(`Error from goolelogin page ${err}`)

  }
}

const googleLoginFail = async(req,res)=>{
  try{
      
    req.session.isLoginFail = true,
    req.session.save()

    res.redirect("/login")

  }catch(err){
    console.log(`Error from goolelogin page ${err}`)

  }
}


// admin verify
const adminVerfy = async(req,res)=>{

  try{

    const email = process.env.adminEmail
    const pass = process.env.adminPass
    
    if(email == req.body.adminEmail && pass == req.body.adminPass)
    {
      req.session.isAdmin = true;
      let isAdmin = req.session.isAdmin
      res.status(200).send({success:true,isAdmin})
    }else{
      
      req.session.isnotCorrect = true
      res.status(500).send({success:false})
    }
  }catch(err){
    res.status(500).send({success:false})
    console.log(`Error from {err}`)
  }


}

// render admin render page
const admin = async(req,res)=>{
  try{
    if(req.session.isAdmin)
    {
      const productData = await productCollection.find({isListed:true})

      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await  cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

       
      }else{

         NofWhilist = 0

      }
      
      res.render("Admin/adminIndex",{productData,NofWhilist})
    }else{
      
      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await  cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

       
      }else{

         NofWhilist = 0

      }

      req.session.isnotCorrect;
      res.render("auth/adminLogin",{isnotCorrect:req.session.isnotCorrect,NofWhilist})
      req.session.isnotCorrect = false;
      req.session.save()

    }
  }catch(err){
    console.log(`Error from admin router admin`)
  }
}




// update for forgot Password

const updatePass = async(req,res)=>{

  try{
    const  _id= req.session.userId 
 
    const changPass = await bcrypt.hash(req.params.id,10)
    await userdata.findByIdAndUpdate({_id},{$set:{userPassword:changPass}});
    res.status(200).send({success:true})

  }catch(err){
    res.status(500).send({success:false})
    console.log(`Error from updatePass router`)
  }
}

// conform Password Page render

const confirmPass = async(req,res)=>{

  if(req.session.isSuccessOtp){

    req.session.forGetEmail  = null         // forget pass of email 

    req.session.isSuccessOtp = null
    let NofWhilist 

    if(req.session.userIsthere){

     NofWhilist = await  cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

     
    }else{

       NofWhilist = 0

    }
    res.render("auth/changePassword",{NofWhilist})

  }

  console.log(`req reached confirmPass router`)
}



// forget Password otp verify

const fOP=async(req,res)=>{   

  try{

    

    const fPO= Number(req.params.id)

    const genOtp =Number(req.session.otp)
    

     if(fPO === genOtp)
     {
      req.session.isSuccessOtp = true
      req.session.otp = null
      req.session.save()
      res.status(200).send({success:true})
     }else{
      res.status(500).send({success:false})
     }

  }catch(err){

      console.log(`Error from err router ${err}`)
  }
  
}




// forgotPassword otp verfication but I am render I used fetch method redirecte

const forgetOtp = async(req,res)=>{

  try{
    if( req.session.forGetEmail){

      req.session.isWrongOtp;
      isWrongOtp = req.session.isWrongOtp                
      req.session.save()
      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await  cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

       
      }else{

         NofWhilist = 0

      }

      res.render("auth/forgotPasswordOtp",{isWrongOtp,NofWhilist})
    }

  }catch(err){

    console.log(`Error from forgetOtp router `)
  }

  
}





// chech email for forgetPassword

const isEmailThere = async (req,res)=>{

  try{
        
        const chechEmail = req.params.id
        const isDetail = await userdata.findOne({userEmail:chechEmail})

      if(isDetail){
        
        
        req.session.forGetEmail = chechEmail
        req.session.userId = isDetail._id
        const forgotOtp=await emailOtp(chechEmail)
        req.session.otp = forgotOtp
      
        req.session.save()
        res.status(200).send({success:true})
        

      }else{

        req.session.invalidEmail = true;
        invalidEmail = req.session.invalidEmail;
        res.status(500).send({success:false,invalidEmail})
      }


  }catch(err){
    console.log(`Error from isEmailThere isEmailThere`)
  }

}

const userLogin = async (req, res) => {
  
  try{
   console.log(`req reached userLogin`)
    const {userEmail, userPassword} = req.body

    const userDetail = await userdata.findOne({userEmail:userEmail})
  

    if(userDetail){

   
      const passCompare = await bcrypt.compare(userPassword,userDetail.userPassword)
     

      if(userDetail.isBlocked==true)
      {
        req.session.isUserBlock = true;
        req.session.save()
        res.status(500).send({success:false,isUserBlock:req.session.isUserBlock,isLoginFail:false}) 
      }
      if(userEmail === userDetail.userEmail && passCompare)
      {
        req.session.userIsthere={
          isAlive:true,
          userName:userDetail.firstName,
          userId :userDetail._id
        }
        
        req.session.save()
        res.status(200).send({ success: true });
      }else{
         req.session.isLoginFail= true
         req.session.save()
        res.status(500).send({success:false,isLoginFail:true})
      }
    }else{
      req.session.isLoginFail = true
      isLoginFail = req.session.isLoginFail
      req.session.save()
      res.status(500).send({success:false,isLoginFail})
    }


  }catch(err){
    console.log(`Error from ${err}`)
  }
  
};

//login render
const loginPage = async (req, res) => {
  try {
    let NofWhilist 

    if(req.session.userIsthere){

     NofWhilist = await  cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

     
    }else{

       NofWhilist = 0

    }

    req.session.isUserBlock;
    req.session.isLoginFail;// user email or password error
    res.render("auth/login",{isLoginFail:req.session.isLoginFail,isUserBlock:req.session.isUserBlock,NofWhilist});
    req.session.isUserBlock = false
    req.session.isLoginFail =false;
    req.session.save()
  } catch (err) {
    console.log(`err from loginPage\n ${err}`);
  }
};

//Resend otp

const resendOtp = async(req,res)=>{

  try{


    const userEmail = req.session.forGetEmail

 
   
    const resendOtp = await emailOtp(userEmail)
  
   
    req.session.otp = resendOtp
    req.session.save()

  }catch(err){
    console.log(`Error from resendOtp router`)
  }

}



async function referralCodeUser(referralCodeId,req){


  try{
    
   

    let userReferal = referralCodeId.toLowerCase()
    const userCReferralCode = await userdata.findOne({referralCode:userReferal})
   

    if(userCReferralCode){
      
      const userWallet = await wallet.findOne({userId:userCReferralCode._id})

      if(userWallet){

        const userIncwallet = await wallet.updateOne({userId:userCReferralCode._id},{$inc:{walletBalance:500}})
   
      }else{

        const walletUpdateFiels = {
          userId:userCReferralCode?._id,
          walletBalance:500
        }

        await wallet(walletUpdateFiels).save()
      }
    }
    return "success"
  }catch(err){
    console.log(`Error from  referralCodeUser function ${err}`)
  }

}


//OtpValue

const otpvalue = async (req,res)=>{

  try{

    console.log(`req entered otpvalue`)

    const otp = Number(req.params.id)
    const genOtp = Number(req.session.otp) 
  
    // assign otp after put null value
  

    if(otp === genOtp)
    {
      req.session.otp = null

      console.log(`step1`)

      const {firstName,lastName,userMobile,userEmail,userPassword} = req.session.userData

 

      console.log(`step2`)
     const referralCode  =  Math.random().toString(36).substring(2,7);  // generate random number
     console.log(`step3`)
     
     console.log(`step4`)

 
      console.log(`---------`)
       await userdata.create({firstName,lastName,userMobile,userEmail,userPassword,referralCode})
  
              //* referalcode add 500 rupees 
              console.log(`step5`)
              if(req.session?.referralCode){
      
                const userReferal = req.session?.referralCode
                const userCReferralCode = await userdata.findOne({referralCode:userReferal})
                              
                  const userWallet = await wallet.findOne({userId:userCReferralCode._id})
  
                  
                  if(userWallet){
  
                
                    const userIncwallet = await wallet.updateOne({userId:userCReferralCode._id},{$inc:{walletBalance:500}})
  
  
                  }else{
  
                    const walletUpdateFiels = {
                      userId:userCReferralCode?._id,
                      walletBalance:500
                    }
  
                    await wallet(walletUpdateFiels).save()
                  }
  
          
  
  
  
              req.session.referralCode = null
              
            }
            console.log(`step6`)
            const userDetail = await userdata.findOne({userEmail:userEmail})
            console.log(`step7`)
           req.session.userData = null
           console.log(`step8`)
           req.session.userIsthere ={
             isAlive:true,
             userName:firstName,
             userId :userDetail?._id
           }
  
           req.session.save()
           console.log(`step9`)
           await wallet({userId:userDetail?._id}).save()
           console.log(`step10`)
        return   res.status(200).send({ success: true });
     
      
    }else{
  
      req.session.isWrongOtp = true;
      isWrongOtp = req.session.isWrongOtp
      res.status(500).send({ success: false, isWrongOtp});

    } 
  
  }catch(err){
    console.log(`Errom from ${err}`)
  }

}


//otpSend
const emailOtp = async (email) => {


  try {
   
    const emailID = email;

    const transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        // user: "skgullfy0718@gmail.com",      
        // pass: "kmim xnpj piul qyto",
        user: "suresh007inr@gmail.com",      
        pass: "mgkq zeeq trdv dysn",

      },
    });
  
    const otp = Math.floor(100000 + Math.random() * 900000);

    const mailOptions = {
      from: "suresh007inr@gmail.com",
      to: emailID,
      subject: "OTP Verification",
      text: `Your OTP IS:${otp}`,
    };

    console.log(otp)
   
    //Send the email


    let mail = await transport.sendMail(mailOptions);
    return otp

  } catch (err) {
    console.log(`Error from emailOtp router ${err}`);
  }
};

//otpPage render

const otpPage = async (req, res) => {

  try {
    
    if(req.session.otpPageGet){
      req.session.isWrongOtp;
      let NofWhilist 

      if(req.session.userIsthere){

       NofWhilist = await  cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

       
      }else{

         NofWhilist = 0

      }
      res.render("auth/OTP",{isWrongOtp:req.session.isWrongOtp,NofWhilist})
      req.session.isWrongOtp = false
      req.session.otpPageGet = null // dont access url path
      req.session.save()
    }
   
  } catch (err) {
    console.log(`err from otpPage\n ${err}`);
  }
};

// sign data store database

const signUp = async(req,res)=>{

  try{
          const emailExcisting = await userdata.findOne({userEmail:req.body.userEmail})

          
          if(!emailExcisting){

            const pass = await bcrypt.hash(req.body.userPassword,10)

          
            const userData = {
                       firstName : req.body.firstName,
                       lastName : req.body.lastName,
                       userMobile : req.body.userMobile,
                       userEmail : req.body.userEmail,
                       userPassword : pass,
                      
            }
            const otp = await emailOtp(req.body.userEmail)
          
            req.session.otp = otp
            req.session.userData = userData
            req.session.otpPageGet = true
            res.redirect("/otpPage")
                               
          }else{

            req.session.emailExcisting = true
            res.redirect("/register")
          }
              
  
  }catch(err){
    console.log(`Erro from signUP router ${err}`)
  }

    
}

// render registerPage
const registerPage = async (req, res) => {
  try {
    req.session.referralCode = req.query?.referralCode

    req.session.emailExcisting;
    req.session.save()
    let NofWhilist 

    if(req.session.userIsthere){

     NofWhilist = await  cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

     
    }else{

       NofWhilist = 0

    }

    res.render("auth/register",{emailExcisting:req.session.emailExcisting,NofWhilist});
    req.session.emailExcisting = false;
    req.session.save()
  } catch (err) {
    console.log(`err from registerPage\n ${err}`);
  }
};



const forgetPage = async (req, res) => {
  try {
    req.session.invalidEmail;
    req.session.save()
    let NofWhilist 

    if(req.session.userIsthere){

     NofWhilist = await  cartCollection.find({userId:req.session?.userIsthere?.userId}).countDocuments() ?? 0

     
    }else{

       NofWhilist = 0

    }

    res.render("auth/Forgot password",{invalidEmail:req.session.invalidEmail,NofWhilist});
    req.session.invalidEmail = false
  } catch (err) {
    console.log(`err from forgetPage\n ${err}`);
  }
};

module.exports = {
  googleLoginFail,
  googleLogin ,
  adminVerfy,  // admin verify
  admin, // render admin login Page
  updatePass, // update the forgot Password
  confirmPass,// confirm page render for forgot email
  fOP, // forgot password changed Otp verifey
  forgetOtp, // forgot Password with otp page 
  isEmailThere, // email chech for forget password
  loginPage,
  registerPage,
  forgetPage,
  userLogin,
  resendOtp,
  emailOtp,
  otpPage,
  otpvalue,
  signUp,
};
