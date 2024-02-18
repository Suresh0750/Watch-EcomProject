const mongoose = require("mongoose")


const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:"userData"
    },
    productId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:"products"
    },
    productQuantity:{
        type:Number,
        required:true,
        default:1,
        min:1
    },
    totalCastPerproduct:{
        type:Number
    }
})


const cartCollecttion = mongoose.model('cartCollection',cartSchema)

module.exports = cartCollecttion