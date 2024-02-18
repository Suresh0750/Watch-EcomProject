




const   isUser = async (req,res,next)=>{

    if(req.session.userIsthere)
    {
        next()
    }else{
        res.redirect("/login")
    }
}

// is User block


const isBlock = async (req,res,next)=>{

    if(req.session.isUserBlock)
    {
        console.log(req.session.isUserBlock)
        res.redirect("/login")
    }else{
        next()
    }
}
module.exports = {isUser,isBlock}