const userdata = require("../models/userModel")












//userBlock 


const isBlock = async(req,res)=>{

    try{


        const _id = req.params.id

        const block = await userdata.findOne({_id:_id})
        


        if(block.isBlocked == false ){

            req.session.isUserBlock = true
            await userdata.findByIdAndUpdate({_id:_id},{$set:{isBlocked:true}})
            res.status(200).send({success:true})
        }else if(block.isBlocked == true)
        {
            req.session.isUserBlock = false
            await userdata.findByIdAndUpdate({_id:_id},{$set:{isBlocked:false}})
            res.status(200).send({success:true})
        }
        

    }catch{
        res.status(500).send({success:false})
            console.log(`Error from isBlock router`)
    }

}


//userList Page show
const pageList = async(req,res)=>{
    try{
        if(req.session.isAdmin)
        {
            const userDetails = await userdata.find({})
            res.render("Admin/userList",{userDetails})
        }
    }catch(err){
        console.log(`Error from pageList Router`)
    }
}

const logOut = async(req,res)=>{

    try{
        

            req.session.isAdmin = false
            res.redirect("/admin")
       
    }catch(err){

    }
}


module.exports = {
    isBlock, //userBlock 
    logOut,
    pageList
}