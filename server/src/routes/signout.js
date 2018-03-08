const express = require('express');
const router = express.Router();

const checkLogin = require('../middlewares/check').checkLogin;

// GET /signout 
router.get('/', checkLogin, function(req, res, next){
    // clear session
    req.session.user = null;
    res.redirect('/home');
});

module.exports = router;