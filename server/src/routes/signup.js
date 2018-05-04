const express = require('express');
const CryptoJS = require('crypto-js');
const Web3 = require('web3')
const router = express.Router();

const UserModel = require('../models/users');
const checkNotLogin = require('../middlewares/check').checkNotLogin;
const adminAccount = "0x7949cbab5bb23342a90e87da70ef20534c6e7c4b";
// set provider
if (typeof web3 !== 'undefined') {
	var web3 = new Web3(web3.currentProvider);
} else {
	// set the provider you want from Web3.providers
	var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// GET /signup
router.get('/', checkNotLogin, function(req, res, next){
    res.render('signup');
});

function validateEmail(email) {
    let re = /^[a-z0-9\.\-\_]+\@[a-z0-9\-\_]+(\.[a-z0-9\-\_]+){1,4}$/;
    return re.test(email.toLowerCase());
}

function validateSUID(suid){
    let re = /^\d{9}$/;
    return re.test(suid);
}

/**
 * Checks if the given string is an address
*/
function isAddress(address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return true
        return true;
    } else {
        // Otherwise check each case
        return isChecksumAddress(address);
    }
};

/**
 * Checks if the given string is a checksummed address
*/
function isChecksumAddress(address) {
    // Check each case
    address = address.replace('0x','');
    var addressHash = sha3(address.toLowerCase());
    for (var i = 0; i < 40; i++ ) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
};

// POST /signup
router.post('/', checkNotLogin, function(req, res, next){
    let username = req.fields.username;
    let email = req.fields.email;
    let suid = req.fields.suid;
    let avatar = '/img/default_user.png';
    let password = req.fields.password;
    let password_confirm = req.fields.password_confirm;

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

    let account = web3.eth.personal.newAccount(password, function(err, newAccount){
        if(err){
            console.log(err);
        }else
        {
            // encrypt password
            const crypted = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
            // new record
            let user = 
            {
                username: username,
                email: email,
                account: newAccount,
                password: crypted,
                suid: suid,
                avatar: avatar,
            };

            // write to database
            UserModel.create(user).then(function(result){
                user = result.ops[0];
                console.log(user);
                delete user.password;
                req.session.user = user;
                web3.eth.sendTransaction({from: adminAccount, to: newAccount, value: web3.utils.toWei('10', 'ether')},
                function(err, transactionHash){
                    if(err)
                    {
                        console.log(err);
                        res.send('internal error');
                    }
                    else
                    {
                        console.log("server transfer receipt: " + transactionHash);
                        req.flash('success', 'signup successfully');
                        res.redirect('/home')
                    }
                });
            }).catch(function(error){
                if(error.message.match('E11000 duplicate key'))
                {
                    req.flash('error', 'username has been used');
                    res.redirect('/signup');
                }
                next(error);
            });
        }
    });
});

module.exports = router;