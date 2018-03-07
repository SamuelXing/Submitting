const express = require('express');
const router = express.Router();

const checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup
router.get('/', checkNotLogin, function(req, res, next){
    res.send('dummy');
});

// POSt /signup
router.get('/', checkNotLogin, function(req, res, next){
    res.send('dummy');
});

module.exports = router;