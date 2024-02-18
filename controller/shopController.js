const product = require("../models/productModule")
const categories = require('../models/categoriesModel')
const userId = require("../models/userModel") 
const cartCollection = require("../models/cartModel")







// delete cart details


const deletCart = async(req,res)=>{

    try{
        const id = req.params.id

        await cartCollection.findByIdAndDelete({_id:id})
        res.status(200).send({success:true})
    }catch(err){
        res.status(500).send({success:false})
        console.log(`Error from deletCart ${err}`)
    }

}




// grandTotal 


const grandTotal = async (req)=>{

    try{
        const userId = req.session.userIsthere.userId

        let userCartData = await cartCollection.find({userId : userId}).populate("productId")
    
        let grandTotal =0
        for(var s of userCartData)
        {
            grandTotal += s.productId.productPrice * s.productQuantity
    
            await cartCollection.updateOne({_id:s._id},{$set:{totalCastPerproduct: s.productId.productPrice * s.productQuantity}})
        }
    
        userCartData = await cartCollection.find({userId:userId}).populate("productId")
    
        req.session.grandTotal =  grandTotal
        req.session.save()
        return userCartData

    }catch(err){
        console.log(`Error from grandTotal :\n${err}`)
    }

     

}
// viewCartPage customer decrease quentity

const decQty = async (req, res) => {
    try {
      let cartProduct = await cartCollection
        .findOne({ _id: req.body._id })
        .populate("productId");
      if (cartProduct.productQuantity > 1) {
        cartProduct.productQuantity--;
    }
    cartProduct = await cartProduct.save();
      await grandTotal(req);
      res.json({
        success: true,
        cartProduct,
        grandTotal: req.session.grandTotal,
        currentUser: req.session.currentUser,
        user: req.body.user,
      });
    } catch (error) {
      console.error(error);
    }
}
// viewCartPage customer update

const incQty = async(req,res)=>{

        try {
        
          let cartProduct = await cartCollection
            .findOne({ _id: req.body._id})
            .populate("productId");
       
          if (cartProduct.productQuantity < cartProduct.productId.productStock) {
            cartProduct.productQuantity++;
          }
          cartProduct = await cartProduct.save();
          await grandTotal(req);
          res.json({
            success: true,
            grandTotal: req.session.grandTotal,
            cartProduct,
            currentUser: req.session.currentUser,
            user: req.body.user,
          });

        } catch (error) {
          console.error(error);
        }
}



// const viwCart = require("../controller/viewCartController")



const userCartPage = async (req,res)=>{

    try{

        let userCartData = await grandTotal(req);
        

        // const userId = req.session.userIsthere.userId
        // const userViewCart = await cartCollection.find({userId:userId})
        res.render("shop/Viewcart",{isAlive:req.session.userIsthere,cartTotal:req.session.grandTotal,userCartData,grandTotal})

    }catch(err){
        console.log(` Error from userCartpage :\n${err}`)
    }
}






// addCart 

const addCart = async (req,res)=>{

    try{
        console.log(`req reached addCart`)

        const id = req.params.id

        const userId =  req.session.userIsthere.userId
        const exitCart = await cartCollection.find({userId:userId, productId:id})
        
        if(exitCart.length !=0){
            
            await cartCollection.updateOne({_id:exitCart._id},{$inc:{productQuantity:1}})
            res.status(200).send({success:true})
        }else{

            
            const productDatail = await product.findOne({_id:id})
            
            const cart ={
                userId : userId,
                productId : productDatail._id,
                productQuantity : productDatail.productStock,
                totalCastPerproduct : productDatail.productPrice
            }
            
    
            const cartDetail = await new cartCollection(cart).save( )
            
            res.status(200).send({success:true})
        }
    }catch{
        res.status(500).send({succuess:false})
    }


}



// singleProduct

const singleProduct = async (req,res)=>{

    try{
        const id = req.params.id
        const productDetails = await product.find({_id:id})
        const categoriesDetail = await categories.find({_id:id})
        req.session.userIsthere;
        res.render("shop/single_product-Page",{productDetails,categoriesDetail,isAlive:req.session.userIsthere})
    }catch(err){
        console.log(`Error from singleProduct`)
    }
}

const landingPage = async (req,res)=>{

    try{
        console.log('hello all')
        const allCatagory =  await categories.find({})
        req.session.userIsthere;
        res.render("shop/index",{isAlive:req.session.userIsthere,allCatagory})
    }catch(err){
        console.log(`Error from landingPage`)
    }

 
}
const categoriesProduct = async (req,res)=>{

    try{
        const productDatail = await product.find({isListed : true})
        req.session.userIsthere;
        res.render("shop/categories",{productDatail,isAlive:req.session.userIsthere})
    }catch(err){
        console.log(`Error from categoriesProduct Page`)
    }
}

const logOut = async(req,res)=>{

    try{
    req.session.userIsthere = false
    res.status(200).send({success:true})
    }catch(err){
        res.status(500).send({success:false})
        console.log(`Error from logOut router`)
    }
    
}
module.exports = {
    // view cart

    deletCart,
    incQty, // increament cart userQuenty
    decQty, // decreament cart userQuenty

    //--------------
    userCartPage,
    addCart, // addCart from single product
    singleProduct,
    landingPage,
    categoriesProduct,
    logOut
}
