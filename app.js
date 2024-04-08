const express = require("express")

const app = express()

const path = require("path")

//* passport for google athendication
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

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

//* Initialize Passport and restore authentication state from session
app.use(passport.initialize())
app.use(passport.session())

//* Passort configuation

passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL:process.env.callbackURL,
    passReqToCallback:true
},(req,accessToken,refreshToken,profile,done)=>{
    try{
        console.log(`step 1`,profile)
        return done(null,profile)

    }catch(err){
        console.log(`Error from GoogleStrategy ${err}`)
    }
}))


//* serialize and deserialize user
passport.serializeUser((user,done)=>{
    try{
        console.log(`step 2`,user)
        done(null,user)

    }catch(err){

        console.log(`Error from serializeUser ${err} `)
    }
})


passport.deserializeUser((user,done)=>{
    try{

        console.log(`step 3`,user)
        done(null,user)

    }catch(err){
        console.log(`Error from deserialize ${err}`)
    }
})

// Routers
const shopRouter = require("./router/shopRouter")
const authRouter = require("./router/authRouter")
const adminRouter = require("./router/adminRouter")
const userRouter = require("./router/userRouter")
const googleAthendication = require("./service/googleAthendication")



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
  

  app.use(authRouter)
  app.use(googleAthendication)
  app.use("/admin",adminRouter)
  app.use("/user",userRouter)
  app.use(shopRouter)  // shop and user cart it there


const PORT = process.env.PORT || 9001

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`)
})
