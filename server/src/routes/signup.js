const express = require('express');
const CryptoJS = require('crypto-js');
const router = express.Router();

const UserModel = require('../models/users');
const checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup
router.get('/', checkNotLogin, function(req, res, next){
    res.render('signup');
});

function validateEmail(email) {
    let re = /^[a-z0-9\.\-\_]+\@[a-z0-9\-\_]+(\.[a-z0-9\-\_]+){1,4}$/;
    return re.test(email.toLowerCase());
}

// function validateSUID(suid){
//     let re = /^\d{9}$/;
//     return re.test(suid);
// }

// POST /signup
router.post('/', checkNotLogin, function(req, res, next){
    const username = req.fields.username;
    const email = req.fields.email;
    const suid = req.fields.suid;
    const avatar = '/public/image/default_user.png';
    const password = req.fields.password;
    const password_confirm = req.fields.password_confirm;

    // verify input
    try {
        if(!(username.length >=4 && username.length <= 10))
        {
            throw new Error('username has to within 4-10 characters');
        }
        if(!validateEmail(email))
        {
            throw new Error('invalid email format');
        }
        // if(!validateSUID(suid))
        // {
        //     throw new Error('invalid SUID');
        // }
        if (password.length < 6) {
            throw new Error('password has to have at least 6 character');
        }
        if(password != password_confirm)
        {
            throw new Error('the input passwords are not consist');
        }
    }catch(error)
    {
        req.flash('error', error.message);
        return res.redirect('/signup');
    }
    
    // encrypt password
    const crypted = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    // new record
    let user = 
    {
        username: username,
        email: email,
        password: crypted,
        suid: suid,
        avatar: avatar,
    };
    // write to database
    UserModel.create(user).then(function(result){
        user = result.ops[0];
        console.log(user);
        delete user.password;
        // req.session.user = user;
        req.flash('success', 'signup successfully');
        res.redirect('/home')
        // res.send('successfully');
    }).catch(function(error){
        if(error.message.match('E11000 duplicate key'))
        {
            req.flash('error', 'username has been used');
            res.redirect('/signup');
        }
        next(error);
    });
});

module.exports = router;