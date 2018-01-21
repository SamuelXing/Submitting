#!/usr/bin/env node
const web3 = require('web3');
const fs = require('fs');
const path = require('path');
const CryptoJS = require("crypto-js");
const contract = require('truffle-contract');
const Websocket = require('ws');

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

function Uploader(url, cb)
{
    this.ws = new Websocket(url);
    if(cb) this.ws.onopen = cb;
    this.sendQueue = [];
    this.sending = null;
    this.sendCallback = null;
    this.ondone = null;
    let self = this;
    this.ws.onmessage = function (event) {
        let data = JSON.parse(event.data)
        let callback;
        if(data.event === 'complete')
        {
            if(data.path !== self.sending.path)
            {
                self.sendQueue = [];
                self.sending = null;
                self.sendCallback = null;
                throw new Error('Got message for wrong file!');
            }
            self.sending = null;
            callback = self.sendCallback;
            self.sendCallback = null;
            if(callback) callback();
            if(self.sendQueue.length === 0 && self.ondone) self.ondone(null);
            if(self.sendQueue.length > 0)
            {
                let args = self.sendQueue.pop();
                setTimeout(function () {
                    self.sendFile.apply(self, args);
                }, 0);
            }
        }
        else if(data.event === 'error')
        {
            self.sendQueue = [];
            self.sending = null;
            callback = self.sendCallback;
            self.sendCallback = null;
            let error = new Error('Server reported send error for file ' + data.path);
            if(callback) callback(error);
            if(self.ondone) self.ondone(error);
        }
    };
}


Uploader.prototype.sendFile = function (file, cb) {
    if(this.ws.readyState !== Websocket.OPEN) throw new Error('Not connected');
    if(this.sending)
    {
        this.sendQueue.push(arguments);
        return;
    }
    // file data
    let fileData = {name: file, path: "p1/"+file };
    this.sending = fileData;
    this.ws.send(JSON.stringify(fileData));
    try{
        let data = fs.readFileSync(__dirname + '/' + file);
        this.ws.send(data);
    }
    catch(err) {
        console.log(err);
    }
};

Uploader.prototype.close = function () {
    this.ws.close();
}

// upload zip file with receipt file to the server
// socket communication
// check dsbm.json information, construct message, network config
function upload(filename) {
    let path = __dirname + '/' + filename;
    try {
        // file esisted or not, extension check.
        if (!fs.existsSync(path))
            throw new Error("file does not exist");
        if (path.extname(filename) != '.zip')
            throw new Error("has to be a /'.zip/' file");
    }
    catch (err)
    {
        // if err, process
        console.log('ERROR: ' + err);
    }

    console.log(path);
    if(!fs.existsSync(path))
    {
        console.log("Error: file dose not exist")
    }

    let uploader = new Uploader('ws://localhost:8080', function(){
        if(filename === '.')
            return;
        uploader.sendFile(filename, function (error) {
            if(error)
            {
                console.log(error);
                return;
            }
            console.log('Sent: ' + filename);
        });
    });

    uploader.ondone = function () {
        uploader.close();
        console.log('100% done ' + filename + ' sent.');
    };
}
//submit("p1", "hash2297");

module.exports = {init, submit, upload};

