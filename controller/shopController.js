const product = require("../models/productModule")
const categories = require('../models/categoriesModel')
const userId = require("../models/userModel") 
const cartCollection = require("../models/cartModel")
const {AddressModel} = require("../models/addressModel")
const orderModel = require("../models/orderModel")
const razorPay = require("razorpay")

const {KeyId,KeySecret} = process.env

let instance = new razorPay({
    key_id: KeyId,
    key_secret: KeySecret, 
  });
  

// order received page

const orderReceivedPage = async(req,res)=>{
    try{
      
        res.render("shop/orderReceived",{isAlive:req.session.userIsthere,userOrderNo:req.session.orderNumber})
    }catch(err){
        console.log(`Error from orderReceiedPage ${err}`)
    }
}
// order   datas Received 
const orderReceived = async (req,res)=>{

    try{
       
        const userId = req.session.userIsthere.userId


        console.log(`peyment\n${req.body}`)
        
        const userCortdelet = await JSON.parse(JSON.stringify(await cartCollection.find({userId:userId}).populate("productId")))
  
        console.log("req.body.paymentMethod\n"+req.body.paymentMethod)
  

        const orderUser = {
            userId: userId,
            orderNumber:(await orderModel.countDocuments()) + 1,
            paymentType:req.body.paymentMethod,
            addressChosen:req.body.selectAdd,
            grandTotalCost:req.body.grandTotal[0],
            cartData:userCortdelet
        }

 
        req.session.orderNumber = orderUser.orderNumber          // user order No
                        

        await orderModel(orderUser).save()

        await  userCortdelet.map(async(data)=>{
                await cartCollection.findByIdAndDelete({_id:data._id})
            })
    
        res.status(200).send({success:true})
        // res.render("shop/orderReceived")

    }catch(err){
        console.log(`Error from orderReceived ${err}`)
    }
}
// razorPay genOrder


const genOrder = async (req,res)=>{


    try{

        console.log("genOrder\n"+JSON.stringify(req.body))

        const payMentValue = req.body

        console.log(payMentValue.grandTotal[0])
        console.log(process.env.KeyId)
        console.log(process.env.KeySecret)
    
        instance.orders
          .create({
            amount: payMentValue.grandTotal[0] + "00",
            currency: "INR",
            receipt: "receipt#1",
          }).then((order) => {
            console.log('1')

            console.log(`order\n${order.id} `)
            res.json(order)
            // return res.send({ orderId: order.id });
          }).catch((err)=>{
            console.log(err)
          });

    }catch(err){

        console.log(err)

    }


}









// checkoutPage


const checkout = async(req,res)=>{

    try{
        
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
        const exitCart = await cartCollection.findOne({userId:userId, productId:id})

        
        if(exitCart){
           
            await cartCollection.findByIdAndUpdate({_id:exitCart._id},{$inc:{productQuantity:req.body.Qty}})

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
        let productQuantity = await cartCollection.findOne({productId:id,userId:req.session.userIsthere.userId})

        productQuantity = productQuantity?.productQuantity || 0

      


        req.session.userIsthere;
        res.render("shop/single_product-Page",{productDetails,categoriesDetail,isAlive:req.session.userIsthere,productQuantity})
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


// sortCategory 

async function sortCategory (req,products,gte,lte,skip,limit,){

console.log(req.session.sortPrice)

    const categorWiseProduct =  req.session.categorie

    if(req.session.sortPrice === "lowToHigh"){
        

        let productValue = await product.find({isListed:true,parentCategory:categorWiseProduct,productPrice:{$gte:gte,$lte:lte}}).sort({"productPrice":1}).skip(skip).limit(limit)           //* sort the product assending order with category wise

        return productValue

    }else{

        let productValue = await product.find({isListed:true,parentCategory:categorWiseProduct,productPrice:{$gte:gte,$lte:lte}}).sort({"productPrice":-1}).skip(skip).limit(limit)            //* sort the product assending order without category wise

        return productValue

    }


}

// sort the Product


async function sort(req,products,gte,lte,skip,limit){

    

    if(req.session.sortPrice === "lowToHigh"){

        let productValue = await product.find({isListed:true,productPrice:{$gte:gte,$lte:lte}}).sort({"productPrice":1}).skip(skip).limit(limit)        //* sort the product assending order without category wise

        return productValue

    }else{

        let productValue = await product.find({isListed:true,productPrice:{$gte:gte,$lte:lte}}).sort({"productPrice":-1}).skip(skip).limit(limit)        //* sort the product dessending order without category wise

        return productValue

    }

}



// sort wit price 


const sortPrice = async(req,res)=>{


    try{

            if(req.params.id === "clearSort"){

                req.session.sortPrice = null        //* clear the sorting 
               
                req.session.save()
                res.status(200).send({success:true})
            }else{

                req.session.sortPrice = req.params.id     //* sort price 
                
                req.session.save()
                res.status(200).send({success:true})
            }

      

    }catch(err){

        console.log(`Error from sortPrice ${err}`)

    }



}
// filterPrice wise

const priceFilter = async (req,res)=>{


    try{

        
        const price = (req.params.id).split('-')
        

        if(req.params.id == 'allPrice' ){
            price[0] = null
            price[1] = null
        }

       

            req.session.gte = price[0]
            req.session.lte = price[1]

            
            req.session.save()
            res.status(200).send({success:true})
   

        
    }catch(err){

        console.log(`Error from  priceFilter ${err}`)

    }
  
}


// filter allproduct

const categoriesFilter = async (req,res)=>{



    try{

        const filter = req.query.categoriesName

        

        if(filter == "all"){

            req.session.categorie = null
            
            res.status(401).redirect("/categories")     //* 401 is redirect code
        }


        const categoriesCollection = await categories.aggregate([{$match:{isAvailable:true}},{$project:{_id:0,categoryName:1}}])                // for access the categories 

            let i=0
            while(i<categoriesCollection.length){
                
                if(categoriesCollection[i].categoryName === filter ){
                    
                    req.session.categorie= categoriesCollection[i].categoryName
                    
                    break;
                }
               
                i++

            }

            
          const producMax =   await product. aggregate([
                                                    {$match:{parentCategory:req.session.categorie}},
                                                    { $group: { _id: null, maxField: { $max: "$productPrice" } } }
                                                    ,
                                                    {$project:{_id:0,maxField:1}}
                                                    
                                                ])
            const producMin =   await product. aggregate([
                                                    {$match:{parentCategory:req.session.categorie}},
                                                    { $group: { _id: null, minField: { $min: "$productPrice" } } }
                                                    ,
                                                    {$project:{_id:0,minField:1}}
                                                    
                                                ])

            req.session.gte = req.session?.gte || producMin[0]?.minField 
            req.session.lte = req.session?.lte || producMax[0]?.maxField
            req.session.save()

           
           
         
            res.status(401).redirect("/categories?page=1")

        

    }catch (err){

        console.log(`Error from categoriesFilter ${err} `)
    }


}


// render categoriesProduct Page
const categoriesProduct = async (req,res)=>{

    try{

        

        let page = Number(req.query.page) || 1
        let limit = 4
        let count 
        let productDetail;
        let skip;
      
        
        const minPrice = await product.aggregate([{$group:{_id:null,minPrice:{$min:"$productPrice"}}},{$project:{_id:0,minPrice:1}}])           //* for first render the page using for min and max value
        const maxPrice = await product.aggregate([{$group:{_id:null,maxPrice:{$max:"$productPrice"}}},{$project:{_id:0,maxPrice:1}}])           //* for first render the Page using for min and max value

       
      

       const  lte =  Number(req.session?.lte)  || Number(maxPrice[0]?.maxPrice)       //* maximum amout
       const  gte =  Number(req.session?.gte) || Number(minPrice[0]?.minPrice)        //* minmum amount 

        

        skip =  (page-1)*limit
        const categorie = await categories.find({isAvailable:true})

        if(req.session.categorie){

            //** min and max value  accoding the categorie*/ 



            let maxField = await product.aggregate([
                                                {$match:{parentCategory:req.session.categorie}},                    // categorie wise max value
                                                {$group:{_id:null,maxPrice:{$max:"$productPrice"}}},
                                                {$project:{_id:0,maxPrice:1}}
                                            ])
            let minField = await product.aggregate([
                                                {$match:{parentCategory:"Mechanical"}},                             // categorie wise min value
                                                {$group:{_id:null,minPrice:{$min:"$productPrice"}}},
                                                {$project:{_id:0,minPrice:1}}
                                            ])

            const lte =  Number(req.session?.lte)  || Number(maxField[0]?.maxPrice) 
            const gte =  Number(req.session?.gte) || Number(minField[0]?.minPrice) 


            req.session.gteSelectPrice = `${gte}-${lte}`

            // productPrice:{$gte:price[0],$lte:price[1]}
            let categorWiseProduct = req.session.categorie
            productDetail = await product.find({isListed : true,parentCategory:categorWiseProduct,productPrice:{$gte:gte,$lte:lte}}).skip(skip).limit(limit)

            count = await product.find({isListed : true,parentCategory:categorWiseProduct,productPrice:{$gte:gte,$lte:lte}}).countDocuments()
            
            if(req.session.sortPrice){

                productDetail = await sortCategory(req,productDetail,gte,lte,skip,limit)
            }
          
            req.session.sortPrice
           
            res.render("shop/categories",{productDetail,isAlive:req.session.userIsthere,count,limit,categorie,selectPrice:req.session.gteSelectPrice,knowCategorie:req.session.categorie,sort:req.session.sortPrice,page})
             
        }else{
            
                    productDetail = await product.find({isListed : true,productPrice:{$gte:gte,$lte:lte}}).skip(skip).limit(limit)
            
                    count = await product.find({isListed : true,productPrice:{$gte:gte,$lte:lte}}).countDocuments()
                  
                    req.session.gteSelectPrice = `${gte}-${lte}`


                    if(req.session.sortPrice){

                        productDetail = await sort(req,productDetail,gte,lte,skip,limit)           //* sorting the product
                    }


                    req.session.sortPrice       //* for show to user, if user choose or not the sort 
                    res.render("shop/categories",{productDetail,isAlive:req.session?.userIsthere,count,limit,categorie,selectPrice:req.session.gteSelectPrice,knowCategorie:"all",sort:req.session.sortPrice,page:req.query.page})

                    console.log(`rendered`)
        }


    }catch (err){

        console.log(`Error from categoriesProduct ${err}`)
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
    genOrder,             // rezorpay genredor order
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
