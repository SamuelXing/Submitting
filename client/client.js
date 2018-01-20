#!/usr/bin/env node
const web3 = require('web3');
const fs = require('fs');
const path = require('path');
const CryptoJS = require("crypto-js");
const contract = require('truffle-contract');

const datadir = './.dsbm';

let provider = new web3.providers.HttpProvider("http://localhost:8545");

let account_address = "0x67dc50638a81f44f21613ca5c684f8aaf74d8737";
let contract_address = "0x5c5f713742cae8778b8b9d344ed8f076243299e8";

let sc = new contract(require("./build/contracts/SubmitContract.json"));

sc.setProvider(provider);

//var localHash =  CryptoJS.SHA256(strData);
function getContract() {
    return sc.at(contract_address);
}

// init the environment
// create a json file that hold the description info for the dsbm
// configuration parameter - and validate
function init(studentName, suid, email, account_address)
{
    // create data dir,
    if(!fs.existsSync(datadir))
    {
        fs.mkdirSync(datadir);
    }
    // generate dsbm json
    let info = {
      name: studentName,
      suid: suid,
      email: email,
      account_address: account_address,
    };
    let jInfo = JSON.stringify(info, null, '  ');
    console.log(jInfo);
    fs.writeFileSync(datadir+'/'+'personal.json', jInfo, function(err){
       if(err) {
           console.log(err);
       } else {
           console.log('ok.');
       }
    });
}


//check hash value, error check, zip(option),
async function submit(filename) {
    try {
        // file esisted or not, extension check.
        if (!fs.existsSync(__dirname + "/" + filename))
            throw new Error("file does not exist");
        // if (path.extname(filename) != '.zip')
        //     throw new Error("has to be a /'.zip/' file");
    }
    catch (err)
    {
        // if err, process
        console.log('ERROR: ' + err);
    }
    let data = fs.ReadStream(__dirname + "/" + filename);
    let hashValue = CryptoJS.SHA256(data);
    let instance = await getContract();
    let result = await instance.submit(filename, hashValue, {from: account_address});
    console.log(result);
    // if success, write (transaction num, hashValue) to record file
}

// upload zip file with receipt file to the server
// socket communication
function upload(prjName)
{
    // check dsbm.json information, construct message
}

//submit("p1", "hash2297");

module.exports = {init, submit, };


