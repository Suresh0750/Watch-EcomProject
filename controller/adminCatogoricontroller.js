
const categories = require("../models/categoriesModel")







//deletCotogories


const deletIng = async (req,res)=>{
    try{

        const id = req.params.id
        await categories.findByIdAndDelete({_id:id})
        res.status(200).send({success:true})
        
    }catch(err){
        res.status(500).send({success:false})
        console.log(`Error from deletIng router`)
    }
}


// list and unlist 

const listCategories = async(req,res)=>{

    try{
        const id = req.params.id
    
       const data =  await categories.findByIdAndUpdate({_id:req.params.id},{$set: {isAvailable:true}})

       res.status(200).send({success:true})
        
    }catch(err){
        res.status(500).send({success:false})
        console.log(`Error from listCategories page \n${err}`)
    }
}

const unListCategories = async(req,res)=>{

    try{
        let id = req.params.id
        await categories.findByIdAndUpdate({_id:req.params.id},{$set:{isAvailable:false}})
        res.status(200).send({success:true})
    }catch(err){
        res.status(500).send({success:false})
        console.log(`Error from listCategories ${err} page`)
    }
}
// updateCotagories 

const updateCatagory = async(req,res)=>{
    try{
          const id = req.params.id

          const categoryName = req.body.categoryName
          const description = req.body.description
          const image = req.files[0]?.filename
          const data =await categories.findByIdAndUpdate({_id:id},{$set:{categoryName:categoryName,description: description, image:image}})
            res.redirect("/admin/catagories")
            
    }catch(err){
        console.log(`Error from updateCatagory`)
    }
}


// edit categories 
const editCategoriePage = async (req,res)=>{

    try{
        const id = req.params.id

        const editCatagory = await categories.findOne({_id:id})
        res.render("Admin/editeCategories",{edit:editCatagory})

    }catch(err){
        console.log(`Error from editCategoriePage router`)
    }
}


// add Catagery in post method

const addCotegories = async (req,res)=>{
    try{
      
                const  catagoryImage = await new categories({
                    categoryName:req.body.categoryName,
                    description:req.body.description,
                    image:req.files[0].filename
                })

                catagoryImage.save()
                
            res.redirect("/admin/catagories")
        
    }catch(err){
        console.log(`Error from addCategories router `)
    }
}


// add categories page render


const addCotegoriesPage = async (req,res)=>{
    try{

        res.render("Admin/addCategories")
        
    }catch(err){
        
    }
}
// categories

const categoriesPage = async (req,res)=>{

    try{

        let count;
        let skip;
        let limit= 5;

        let catagoriDetail;
        page = Number(req.query.page) || 1
        skip = (page-1)*limit
        count = await categories.find({}).estimatedDocumentCount()
        // const category = await categories.findone({})
        // console.log(categories)
         catagoriDetail = await categories.find({}).skip(skip).limit(limit)
    console.log(catagoriDetail)
        res.render("Admin/adminCatagoires",{catagoriDetail,count,limit})

    }catch(err){
        console.log(`Error from categories page`)
    }
}


module.exports={
    unListCategories, // unlist Categories
    listCategories, // list and unlist categories
    deletIng, // deleteCotagories
    updateCatagory, //updateCatagories
    editCategoriePage, //editcatagoriesPage render
    addCotegories, // add categories 
    categoriesPage, //render categories page
    addCotegoriesPage // render add categories page
}