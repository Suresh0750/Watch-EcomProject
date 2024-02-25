



const orderManagement = async (req,res)=>{

    try{

        res.render("admin/orderManagment")

    }catch(err){

        console.log(`Error from orderManagment ${err}`)
    }
}


module.exports = {
    orderManagement,
}