
const userCollection = require("../models/userModel")
const {AddressModel} = require("../models/addressModel")


// change password page render
const changePassword = async (req,res)=>{
    try{
        const {userId} = req.session.userIsthere
        console.log(req.session.userIsthere)
        res.render("user/changePassUser",{userId})

    }catch(err){

    }
}

// edit Address update data

const editUserData = async (req,res)=>{
    try{

      
        const {name,phone,houseNo,state,city} = req.body
        const {_id} = req.body


        res.status(200).send({success:true})

    }catch(err){

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

        console.log(userId)

        const userAddress = await  AddressModel.find({user_id:userId})

        console.log(`userAddress\n ${userAddress}` )

        res.render("user/myAddress",{isAlive:req.session.userIsthere,userAddress})


    }catch(err){
        console.log(`Error from my Address\n ${err}`)
    }
}

const addAddressData = async (req,res)=>{

    try{
        console.log(req.body)
        console.log(req.session.userIsthere)

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
    changePassword,
    editUserData,
    editAddress, // edite Address page render
    daleteAdd,
    myAddress,
    addAddressData,
    profile,
    addAddress}