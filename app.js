const express = require("express")

const app = express()

const path = require("path")

const session = require("express-session")
//dotenv for MONGO_URL
require("dotenv").config()

// flash 

const flash = require("connect-flash")

app.use(flash())
//connect MongoDB Connected
const connectDB = require("./config/connectDB")
// call mongoDB
connectDB()

// session obj

app.use(session({
    resave:true,
    saveUninitialized:true,
    secret:"my secret"
}))
// Routers
const shopRouter = require("./router/shopRouter")
const authRouter = require("./router/authRouter")
const adminRouter = require("./router/adminRouter")
const userRouter = require("./router/userRouter")




// app.use(express.static(path.join(__dirname,"public")))
app.use(express.static(__dirname + '/public'))
app.set("view engine","ejs")
app.set('views', path.join(__dirname, 'views'));
// require the user data json format

app.use(express.json())
app.use(express.urlencoded({extended:false}))

// cache clear

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  

app.use(shopRouter)  // shop and user cart it there
app.use(authRouter)
app.use("/admin",adminRouter)
app.use("/user",userRouter)


const PORT = process.env.PORT || 9001

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`)
})
