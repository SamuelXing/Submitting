const express = require('express');
const router = express.Router();


// GET /signup
router.get('/', function(req, res, next){
    res.render('admin');
});


// POSt /signup
router.get('/', function(req, res, next){
    res.send('dummy');
});

module.exports = router;