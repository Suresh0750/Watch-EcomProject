const router = require("express").Router()
const passport = require('passport')


router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get('/google/callback',

  passport.authenticate('google', {successRedirect:'/googleLogin', failureRedirect: '/googleLoginFail' }),
  
);

module.exports = router
