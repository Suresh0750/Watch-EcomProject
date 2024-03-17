const productController = require("../models/productModel")
const categories = require("../models/categoriesModel")








// deleteProducte

const deletIngProduct = async (req,res)=>{

  try{

    const id = req.params.id
    console.log(req.params.id)
    await productController.findByIdAndDelete({_id:id})
    res.status(200).send({success:true})
    // res.status(401).redirect("/admin/productPage")
  }catch(err){
    console.log(`Error form deletIngProduct \n ${err} `)
  }

}


// edit Product with Data


const productEdit = async(req,res)=>{
     
    try{
        const id = req.params.id
        const productData = await productController.findOne({_id:id})
        const category = await categories.find({})
        req.session.productExist 
        res.render("Admin/editProduct",{productData,category,isProductExist : req.session.productExist})
        req.session.productExist = false
        req.session.save()
    }catch(err){
      console.log(`Error from producEdit controller ${err}`)
    }
}
// unlist and list


const listProduct = async (req, res) => {
    try {
      await productController.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: true } }
      );
      res.status(200).send({success:true})
    } catch (error) {
      res.status(500).send({success:false})
      console.error(error);
    }
  };
  const unListProduct = async (req, res) => {
    try {
      await productController.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: false } }
      );
      res.status(200).send({success:true})
    } catch (error) {
      res.status(500).send({success:false})
      console.error(error);
    }
  };
// edit product data

const editProduct = async (req, res) => {

    try {
      console.log(`editProduct entered`)
      let existingProduct = await productController.findOne({_id:req.params.id} );
      let  checkProduct = await productController.find({productName:req.body.productName})
     console.log(`checkProduct : ${checkProduct}`)
      console.log(`exitingProduct`)


        console.log(req.body.productId)
        console.log(checkProduct._id)
        if(checkProduct._id !== undefined || checkProduct.length>1){
          if(checkProduct._id !== req.body.productId || checkProduct.length>1 ){
             req.session.productExist = true
            console.log(`=============================`)
             res.redirect(`/admin/productEdit${req.params.id}`)
             return 
          }
        }

      if (!existingProduct || existingProduct._id == req.params.id) {
        console.log("edit1");
  
        const updateFields = {
          $set: {
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productPrice: req.body.productPrice,
            productStock: req.body.productStock,
          },
        };

        
  
        if (req.files[0]) {
          updateFields.$set.productImage1 = req.files[0].filename;
        }
  
        if (req.files[1]) {
          updateFields.$set.productImage2 = req.files[1].filename;
        }
  
        if (req.files[2]) {
          updateFields.$set.productImage3 = req.files[2].filename;
        }
        console.log("updateFields"+updateFields)
        await productController.findOneAndUpdate(
          { _id: req.params.id },
          updateFields
        );
        console.log("edit3");
  
        res.redirect("/admin/productPage")
      } else {
        req.session.productAlreadyExists = existingProduct;
        res.redirect("/admin/productEdit");
      }
    
    } catch (error) {
      console.error(error);
    }
  };
// addProduct with Data

const addProductData = async (req, res) => {

    try {

        console.log(req.body)
        console.log(req.files)
        console.log(`req entry addProductPage`)

        const existProduct = await productController.findOne({productName:req.body.productName})
        if(!existProduct){

          const productData = {
              productName: req.body.productName,
              parentCategory: req.body.parentCategory,
              productImage1: req.files[0].filename,
              productImage2: req.files[1].filename,
              productImage3: req.files[2].filename,
              productPrice: req.body.productPrice,
              productStock: req.body.productStock,
          };
      
          await productController.insertMany([productData])
          
          console.log(`data save server`)
  
          res.redirect("/admin/productPage")
        }else{
          req.session.existAddProduct = true
          res.redirect("/admin/addProduct")
        }

    }catch (err) {
    console.log(`Error from addProductData router`)
}
}


// render addProduct controller

const addProduct = async (req, res) => {
    try {
      console.log(`req reached addProduct router`)
      const categoryDetail = await categories.find({})

      req.session.existAddProduct
        res.render("Admin/addProduct",{categoryDetail,existProduct:req.session.existAddProduct})
        req.session.existAddProduct = false
    } catch (err) {
        console.log(`Error from addProduct router`)
    }
}



// admin product page render


const productPage = async (req, res) => {

    try {

        let count;
        let skip;
        let limit=3
        let dataProduct;
        let page= Number(req.query.page) || 1

        skip  = (page-1)*limit
        count = await productController.find({}).estimatedDocumentCount()
        dataProduct = await productController.find({}).skip(skip).limit(limit)
        
        res.render("Admin/adminProductPage", { productData: dataProduct,count,limit })
    } catch (err) {
        console.log(`Error from productPage router`)
    }
}


module.exports = {
    editProduct,  // edite producte
    unListProduct,
    listProduct,
    deletIngProduct, // delet producte 
    productEdit,    // edite producte
    addProductData, // render addProdctData
    addProduct, // render addProduct
    productPage // render productPage
} 