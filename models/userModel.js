const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    userMobile:{
        type:Number,
        requied:true
    },
    userEmail:{
        type:String,
        required:true
    },
    userPassword:{
        type:String,
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    }
    
})

// mongose.model("collection name","schema validation")
const user = mongoose.model("userData",userSchema)

module.exports = user
