const express = require('express');
const router = express.Router();
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const util = require('util');
const CryptoJS = require("crypto-js");
const Web3 = require('web3')

// set provider
if (typeof web3 !== 'undefined') {
	var web3 = new Web3(web3.currentProvider);
} else {
	// set the provider you want from Web3.providers
	var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

const IDENTITY = "IDENTITY";
const PROOF = "PROOF";

const isAdmin = require('../middlewares/check').isAdmin;

const dir  = path.join(__dirname, '../uploaded');

// read PROOF file, sync read
function readPROOF(PROOF){
	try{
		let rst = [];
		let lines = fs.readFileSync(PROOF, 'utf-8').split('\n');
		for(let i in lines)
		{
			if(lines[i] === '') continue
			rst.push(lines[i].trim().split(/\s+/));
		}
		return rst;
	}
	catch(err)
	{
		console.log(err)
	}
}

// read IDENTITY info
function readIDENTITY(IDENTITY)
{
	try{
		let IDENTITY_Info = fs.readFileSync(IDENTITY, 'utf-8');	
		return JSON.parse(IDENTITY_Info);
	}
	catch(err)
	{
		console.log(err)
	}
}

// verify PROOF
async function _verify(PROOF, IDENTITY, path)
{	
	try{
		let verified = true;
        // create report file
		let report = fs.createWriteStream(path+'/../report.txt', {
			flags: 'a' // 'a' means appending (old data will be preserved)
		});
		if(PROOF.length === 0 || IDENTITY === null) return report;
		for(let i in PROOF)
		{
			let txn = await web3.eth.getTransaction(PROOF[i][0]); // PROOF[i][0] is txnHash
			// verify the ownership of this transaction
            if(txn.from.toUpperCase() !=  IDENTITY.account_address.toUpperCase() 
                // fileHash has logged to blockchain
				|| txn.input.indexOf(PROOF[i][2].slice(2,)) === -1){ 
				verified = false;
			}
			// get timestamp,
			let block = await web3.eth.getBlock(txn.blockNumber);
			let timestamp = block.timestamp;
			// convert timestamp to human readable date
			let date = new Date(timestamp*1000).toUTCString();
			report.write(date + ', submit ' + PROOF[i][1] + ', verified: ' + verified+'\n');
		}
		report.end();
		return;
	}catch(err)
	{
		console.log(err);
	}	
}

// verify
async function verify(path)
{
	try{
		if(!fs.existsSync(path + '/' + IDENTITY) 
		|| !fs.existsSync(path + '/' + PROOF))
		{
			throw new Error('lack of key files, cannot verify');
		}
		// read PROOF
		let PROOFData = readPROOF(path + '/' + PROOF);
		// read IDENTITY info file
		let IDENTITYData = readIDENTITY(path + '/' + IDENTITY);
		// verify
		await _verify(PROOFData, IDENTITYData, path);
	}
	catch(err)
	{
		console.log(err);
	}
}

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
    var currentDir =  dir;
    var query = req.query.path || '';
    if (query) currentDir = path.join(dir, query);
    // verify
    verify(currentDir+'/.dsbm');

    // read current directory, render front end page
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

// POST /signup
router.get('/', function(req, res, next){
    res.send('dummy');
});

module.exports = router;