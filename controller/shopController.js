const product = require("../models/productModule")
const categories = require('../models/categoriesModel')
const userId = require("../models/userModel") 
const cartCollection = require("../models/cartModel")
const {AddressModel} = require("../models/addressModel")

const orderModel = require("../models/orderModel")






// order received page

const orderReceivedPage = async(req,res)=>{
    try{

        res.render("shop/orderReceived")
    }catch(err){
        console.log(`Error from orderReceiedPage ${err}`)
    }
}

const orderReceived = async(req,res)=>{

    try{
        console.log('req reached orderReceived')
        const userId = req.session.userIsthere.userId


        
        const userCortdelet = await cartCollection.find({userId:userId})
        console.log(userId)
        console.log(userCortdelet)
        console.log(req.body)
        console.log("params"+req.params)
        let i=0

        const orderUser = {
            userId: userId,
            orderNumber:i,
            paymentType:req.body.paymentMethod,
            addressChosen:req.body.selectAdd
        }

        i++
        await  userCortdelet.map(async(data)=>{
                await cartCollection.findByIdAndDelete({_id:data._id})
            })
    
        res.status(200).send({success:true})
        // res.render("shop/orderReceived")

    }catch(err){
        console.log(`Error from orderReceived ${err}`)
    }
}

// checkoutPage


const checkout = async(req,res)=>{

    try{
        console.log(req.session.userIsthere)
        const userId =req.session.userIsthere.userId

        let userAddressDetails = await AddressModel.find({user_id:userId})
        if(userAddressDetails.length==0){

            res.redirect("/user/addAddress")
        }
        let userCartData = await grandTotal(req);

        userCartData = userCartData.length==0 ? 0 : userCartData;
    
        res.render("shop/checkoutPage",{isAlive:req.session.userIsthere,cartTotal:req.session.grandTotal,userAddressDetails})
    }catch(err){
        console.log(`Error from checkout Page ${err}`)
    }

}

// !==================================================================================




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
        console.log(userCartData)
        if(userCartData.length==0)
        {
            req.session.grandTotal = 0
            return userCartData
        }
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
        console.log( userCartData)
        // const userId = req.session.userIsthere.userId
        // const userViewCart = await cartCollection.find({userId:userId})
        res.render("shop/Viewcart",{isAlive:req.session.userIsthere,cartTotal:req.session.grandTotal,userCartData})

    }catch(err){
        console.log(` Error from userCartpage :\n${err}`)
    }
}






// addCart 

const addCart = async (req,res)=>{

    try{

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
                productQuantity : req.body.Qty,
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
        console.log(req.params.id)
        const id = req.params.id
        const productDetails = await product.find({_id:id})
        const categoriesDetail = await categories.find({_id:id})
        console.log(productDetails)
        req.session.userIsthere;
        res.render("shop/single_product-Page",{productDetails,categoriesDetail,isAlive:req.session.userIsthere})
    }catch(err){
        console.log(`Error from singleProduct`)
    }
}

const landingPage = async (req,res)=>{

    try{

        const allCatagory =  await categories.find({})
        req.session.userIsthere;
        res.render("shop/index",{isAlive:req.session.userIsthere,allCatagory})
    }catch(err){
        console.log(`Error from landingPage ${err}`)
    }

 
}

// sort wit price 


const sortPrice = async(req,res)=>{
    try{


        if(req.params.id == "lowToHigh"){

            let data = req.session.categoriesFilter


            let i=0
            let temp;
            let j;
             while(i<data.length)
            {
                j=i+1
                while(j<data.length){
                    
                    if(data[i].productPrice>data[j].productPrice)
                    {
                        temp= data[i]
                        data[i]=data[j]
                        data[j]=temp
                    }
                    
                    j++
                }

                i++
            }

        
            req.session.count = (req.session.categoriesFilter).length
            req.session.save()
            res.status(200).send({success:true})
        }else if(req.params.id == "highToLow"){
            let data = req.session.categoriesFilter
            console.log(req.session.categoriesFilter)
            let i=0
            let temp;
            let j;
             while(i<data.length)
            {
                j=i+1
                while(j<data.length){
                    
                    if(data[i].productPrice<data[j].productPrice)
                    {
                        temp= data[i]
                        data[i]=data[j]
                        data[j]=temp
                    }
                    
                    j++
                }
           
                i++
            }
            req.session.categoriesFilter = data
            req.session.count = data.length
            req.session.save()
            res.status(200).send({success:true})
        }
        
    }catch(err){
        res.status(500).send({success:false})
        console.log(`Error from sortPrice ${err}`)
    }
}
// filterPrice wise

const priceFilter = async (req,res)=>{
    try{
        const price = (req.params.id).split('-')

        
        req.session.categoriesFilter = await product.find({isListed:true,productPrice:{$gt:price[0],$lt:price[1]}})
        req.session.count =  (req.session.categoriesFilter).length
        req.session.save()
        res.status(200).send({success:true})

    }catch(err){
        console.log(`Error from price Filter ${err}`)
    }
}


// filter allproduct

const categoriesFilter = async (req,res)=>{

    try{

        req.session.categoriesFilter = await product.find({isListed:true,parentCategory:req.query.categoriesName})
        req.session.count =  (req.session.categoriesFilter).length 

       
        req.session.save()
     

        res.redirect("/categories")

    }catch(err){

        console.log(`Error from categories filter page ${err}`)
    }
}


// render categoriesProduct Page
const categoriesProduct = async (req,res)=>{

    try{
        let limit= 12
        let page = Number(req.query.page) || 1
        let count;
        let skip;
        let productDetail;
        skip = (page-1)*limit
        req.session.categoriesFilter
        req.session.count
        req.session.save()
        // count = await product.find({isListed : true}).estimatedDocumentCount()

        // count = !req.session.count ? count: req.session.count==0 ? limit : req.session.count;
        // count = req.session.count ==0 ? limit : count;

         productDetail = await product.find({isListed : true}).skip(skip).limit(limit)

         productDetail = await  req.session.categoriesFilter ?   req.session.categoriesFilter: productDetail;

         req.session.categoriesFilter = productDetail


         req.session.save()

        
         count = productDetail.length
         const categorie = await categories.find({})
         
        req.session.userIsthere;
        res.render("shop/categories",{productDetail,isAlive:req.session.userIsthere,count,limit,categorie})
        // req.session.categoriesFilter = null
    }catch(err){
        console.log(`Error from categoriesProduct Page\n ${err}`)
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
    orderReceivedPage, // orderReceivedPage rendered

    // order received page
    orderReceived,         // check out to orderReceivedPage
    // checkout Page

    checkout,
    // view cart

    deletCart,
    incQty, // increament cart userQuenty
    decQty, // decreament cart userQuenty

    //--------------
    sortPrice, // lowToHeigh 
    priceFilter, // price wise filter
    categoriesFilter,
    userCartPage,
    addCart, // addCart from single product
    singleProduct,
    landingPage,
    categoriesProduct,
    logOut

}
