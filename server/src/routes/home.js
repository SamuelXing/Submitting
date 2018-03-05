const express = require('express');
const router = express.Router();
const checkNotLogin = require('../middlewares/check').checkNotLogin;
// homepage
router.get('/', checkNotLogin, function(req, res, next){
	res.render('home');
});

module.exports = router;

