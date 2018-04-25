const express = require('express');
const router = express.Router();
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const util = require('util');

const isAdmin = require('../middlewares/check').isAdmin;

const dir  = path.join(__dirname, '../uploaded');
// GET 
router.get('/', isAdmin, function(req, res, next){
    res.render('admin');
});

// download file
router.get('/download/:filename', isAdmin, function(req, res, next){
   let filename = req.params.filename;
   filename = filename.replace (/-/g, '/');
   // TODO: fix
   res.download(dir + '/' + filename);
});

router.get('/files', function(req, res) {
    var currentDir =  dir;
    var query = req.query.path || '';
    if (query) currentDir = path.join(dir, query);
    // console.log("browsing ", currentDir);
    fs.readdir(currentDir, function (err, files) {
        if (err) {
           throw err;
         }
         var data = [];
         files
         .filter(function (file) {
             return true;
         })
         .forEach(function (file) {
           try {
                //console.log("processing ", file);
                let isDirectory = fs.statSync(path.join(currentDir,file)).isDirectory();
                let mtime = fs.statSync(path.join(currentDir,file)).mtime;
                let birthtime =  fs.statSync(path.join(currentDir,file)).birthtime;
                if (isDirectory) {
                    data.push({ Name : file, IsDirectory: true, mtime: mtime, birthtime: birthtime, Path : path.join(query, file) });
                } else {
                    let ext = path.extname(file);
                    data.push({ Name : file, Ext : ext, IsDirectory: false, mtime: mtime, birthtime: birthtime, Path : path.join(query, file)});
                }
           } catch(e) {
             console.log(e);
           }
         });
         data = _.sortBy(data, function(f) { return f.Name });
         res.json(data);
     });
   });

router.get('/verify', function(req, res, next){
    res.send('verified');
});

// POST /signup
router.get('/', function(req, res, next){
    res.send('dummy');
});

module.exports = router;