var express = require('express');
const CryptoJS = require('crypto-js');
var router = express.Router();

const UserModel = require('../models/users');
const checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin
router.get('/', checkNotLogin, function(req, res, next)
{
    res.render('signin')
});

// POST /signin
router.post('/', checkNotLogin, function(req, res, next){
    const username = req.fields.username;
    const password = req.fields.password;

    UserModel.getUserByName(username).then(function(user){
        if(!user)
        {
            req.flash('error', 'invalid user');
            return res.redirect('back');
        }
        const crypted = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
        if(crypted !== user.password )
        {
            req.flash('error', 'wrong password or username');
            return res.redirect('back');
        }
        req.flash('success', 'sign in successfully');
        const remember = req.fields.remember;
        delete user.password;
        req.session.user = user;
        res.redirect('/home');
    }).catch(next);
});

module.exports = router;
