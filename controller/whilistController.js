

const whishlistModel = require("../models/whislistModel")
const productModel = require("../models/productModel")
const cartModel = require("../models/cartModel")



//* delete data from whishlist 


const deleteDataWhishlist = async (req,res)=>{

  try{

    const userId = req.session?.userIsthere?.userId

    // console.log(req.body)
    // await whishlistModel.findByIdAndUpdate({"whishlist._id":req.body.id})

    const userWhishlist = await whishlistModel.findOne({userId})

    userWhishlist.whishlist.forEach(async(val)=>{


    
      if(val._id == req.body.id){

      const userWhishList= await whishlistModel.updateOne({userId:userId},{$pull:{whishlist:{_id:req.body?.id}}})


      }
     
   })


    res.status(200).send({success:true})

  }catch(err){

    console.log(`Error from deleteDataWhishlist ${err}`)
  }
}



//*addToCart from whislist Page

const addToCart = async (req,res)=>{

  try{

    console.log(`req reached addToCart`)
    const userId = req.session?.userIsthere?.userId

    const cartDetails = await cartModel.findOne({userId:userId,productId:req.body.id})
    const productDetails = await productModel.findOne({_id:req.body.id})

    if(cartDetails){

      if(Number(cartDetails.productQuantity)<Number(productDetails.productStock)){

        await cartModel.findByIdAndUpdate({_id:cartDetails._id},{$inc:{productQuantity:1}})

        res.status(200).send({success:true,message:'product added'})
      }else{

        res.status(501).send({success:false,message:"cart stack exist"})

      }


    }else{

      if(productDetails.productStock>0){

        const cartData = {
          userId,
          productId:req.body.id,
          productQuantity:1,
          totalCastPerproduct:productDetails.productPrice
        }


        await cartModel(cartData).save()

        res.status(200).send({success:true,message:"cartAdd"})
      }

    }
     
  }catch(err){

    console.log(`Error from addToCart controller ${err}`)
  }
}


//* add whishlist data at whishlist database


const addWhishlist = async (req,res)=>{

  try{
    console.log(`req reached addWhishlist`)
    const productId = req.body?.id
    const userId = req.session?.userIsthere?.userId

    const whishlistIsthere = await whishlistModel.findOne({userId:userId})

    console.log(`-------------`)
    console.log(whishlistIsthere)

    if(whishlistIsthere){


      let whishlist = whishlistIsthere.whishlist
            let i=0
            while(i<whishlist.length){
                
                
                if(whishlist[i].productId==productId){


                    return res.status(200).send({success:true,existProduct:true})
                    
                }
                
           
                i++
            }

      await whishlistModel.findByIdAndUpdate({_id:whishlistIsthere._id},{$push:{whishlist:{productId}}})    //*  whishlist account is already there in account only we push that productId onyly
    }else{

      const userWhishlist = {
                          userId,
                        whishlist:[
                        {productId}
                        ]
                    
                        }

          await whishlistModel(userWhishlist).save()

    }

   res.status(200).send({success:true,existProduct:false})
   
  }catch(err){
    res.status(501).send({success:false})

    console.log(`Error from addWhishlist ${err}`)
  }
}

 //* wishlist

 const wishlist = async (req,res)=>{

    try{

      const userWhishlist = await whishlistModel.findOne({userId:req.session?.userIsthere?.userId}).populate('whishlist.productId')

      res.render("user/wishlist",{isAlive:req.session.userIsthere,userWhishlist})

    }catch(err){

      console.log(`Error form whislist contrillect ${err}`)
    }
  }

  //*

  module.exports ={wishlist,addWhishlist,addToCart,deleteDataWhishlist}