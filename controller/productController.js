const productController = require("../models/productModule")
const categories = require("../models/categoriesModel")








// deleteProducte

const deletIngProduct = async (req,res)=>{

    const id = req.params.id
    await productController.findByIdAndDelete({_id:id})

    res.redirect("/admin/productPage")
}


// edit Product with Data


const productEdit = async(req,res)=>{
     
    try{
        const id = req.params.id
        const productData = await productController.findOne({_id:id})
        const category = await categories.find({})
        res.render("Admin/editProduct",{productData,category})
    }catch(err){

    }
}
// unlist and list


const listProduct = async (req, res) => {
    try {
      await productController.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: true } }
      );
      res.redirect("/admin/productPage");
    } catch (error) {
      console.error(error);
    }
  };
  const unListProduct = async (req, res) => {
    try {
      await productController.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: false } }
      );
      res.redirect("/admin/productPage");
    } catch (error) {
      console.error(error);
    }
  };
// edit product data

const editProduct = async (req, res) => {

    console.log("edit");
    console.log(req.params.id)
    console.log(req.body)
    try {
      console.log(`editProduct entered`)
      let existingProduct = await productController.findOne({_id:req.params.id}
      );
      console.log(`exitingProduct`)
      console.log(`exit ${existingProduct}`)
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

        console.log(req.files)
  
        if (req.files[0]) {
          updateFields.$set.productImage1 = req.files[0].filename;
        }
  
        if (req.files[1]) {
          updateFields.$set.productImage2 = req.files[1].filename;
        }
  
        if (req.files[2]) {
          updateFields.$set.productImage3 = req.files[2].filename;
        }
  
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

    }catch (err) {
    console.log(`Error from addProductData router`)
}
}


// render addProduct controller

const addProduct = async (req, res) => {
    try {
      console.log(`req reached addProduct router`)
      const categoryDetail = await categories.find({})


        res.render("Admin/addProduct",{categoryDetail})
    } catch (err) {
        console.log(`Error from addProduct router`)
    }
}



// admin product page render


const productPage = async (req, res) => {

    try {
        const dataProduct = await productController.find({})
        console.log(`dataProduct\n ${dataProduct}`)
        res.render("Admin/adminProductPage", { productData: dataProduct })
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