

const mongose = require("mongoose")

const connectDB = async ()=>{

    try{
        
        await mongose.connect(process.env.MONGO_URL)
        console.log(`Mongodb is succesfully connnected`)

    }catch(err){
        console.log(`Error from Mongose Connect \n ${err}`)
    }
}

module.exports = connectDB