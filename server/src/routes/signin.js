const express = require('express');
const router = express.Router();

const checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin
router.get('/', checkNotLogin, function(req, res, next)
{
    res.send('dummy');
});

// POST /signin
router.post('/', checkNotLogin,function(req, res, next){
    res.send('dummy');
});

module.exports = router;
