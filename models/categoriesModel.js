const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({

    categoryName:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    isAvailable:{
        type:Boolean,
        default:true
    }
})


module.exports = mongoose.model("Category",categorySchema)