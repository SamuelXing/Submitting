#!/usr/bin/env node
// TODO: error check
// TODO: command line prompt

const web3 = require('web3');
const fs = require('fs');
const path = require('path');
const CryptoJS = require("crypto-js");
const contract = require('truffle-contract');
const Websocket = require('ws');
const archiver = require('archiver');
const moment = require('moment');

const curDir = process.cwd();
const datadir = process.cwd() + '/.dsbm';

const PROOF = '.dsbm/PROOF';             // local record
const IDENTITY =  '.dsbm/IDENTITY'; // personal indentity

let provider = new web3.providers.HttpProvider("http://127.0.0.1:8550");
let sc = new contract(require("./build/contracts/SubmitContract.json"));

sc.setProvider(provider);

async function getContract() {
    return await sc.deployed()
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
        console.log(datadir);
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
    fs.writeFile(datadir+'/'+'IDENTITY', jInfo, function(err){
       if(err) {
           console.log(err);
       } else {
           console.log(datadir+'/IDENTITY');
       }
    });
    // create PROOF
    fs.close(fs.openSync(datadir + '/' + 'PROOF', 'w'), function (err) {
        if(err) {
            console.log(err);
        } else {
            console.log(datadir+'/'+'PROOF');
        }
    });
}


//check hash value, error check, zip(option),
async function submit(filename) {
    try {
        // file esisted or not, extension check, __dirname: get current dir
        if (!fs.existsSync(curDir + '/' + filename))
            throw new Error("file does not exist");
        let info = fs.readFileSync(datadir + '/' + 'IDENTITY', 'utf-8');
        let infoObj = JSON.parse(info)
        // retrieve personal info
        let data = fs.readFileSync(curDir + '/' + filename, 'utf-8');
        let hashValue = CryptoJS.SHA256(data);
        let hashStr = '0x' + hashValue.toString(CryptoJS.enc.Hex);
        let instance = await getContract();
        // Submit to current file's hash to blockchain
        let result = await instance.submit(filename, hashStr, {from: infoObj.account_address});
        let record = '' + result.tx + '  ' + hashStr + '\n';
        console.log('Transaction\tFile Hash');
        console.log(record);
        console.log('Your\'ve submit ' + filename+ ', here is your receipt: \n');
        console.log(result.receipt);
        fs.appendFile(datadir +'/'+ 'PROOF', record, function (err) {
            if (err) throw err;
        });
    }
    catch (err)
    {
        // if err, process
        console.log('You\'ve already submit this file before');
    }
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
    try{
        if(this.ws.readyState !== Websocket.OPEN)
            throw new Error('Not connected');
        if(this.sending)
        {
            this.sendQueue.push(arguments);
            return;
        }
        // construct msg head
        if(!fs.existsSync(datadir+'/IDENTITY'))
            throw new Error('has to run init first');
        let dataStream = fs.readFileSync(datadir+'/IDENTITY');
        let jsonData = JSON.parse(dataStream);
        let remotePath = jsonData.name + '_' + jsonData.suid;
        justFilename = path.basename(file);
        // file data
        if(path.extname(file) === '.zip'){
            let time = moment();
            let timestamp = time.format('YYYYMMDDHHmmss');
            justFilename = timestamp + '_' + path.basename(file);
        }
        let fileData = {name: justFilename, path: remotePath+"/"+justFilename};
        this.sending = fileData;
        this.ws.send(JSON.stringify(fileData));
        let data = fs.readFileSync(curDir + '/' + file);
        this.ws.send(data);
    }
    catch(err) {
        console.log(err);
    }
};

Uploader.prototype.close = function () {
    this.ws.close();
}

// traverse working directory
function traverse(dir, ignore, filelist)
{
    files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(dir + '/' + file).isDirectory() && ignore.indexOf(file) <= -1) {
            filelist = traverse(dir + '/' + file, ignore, filelist);
        }
        else {
            if(ignore.indexOf(file) <= -1)
                filelist.push(dir + '/' + file);
        }
    });
    return filelist;
}

// upload zip file with receipt file to the server
// socket communication
// check dsbm.json information, construct message, network config
function upload() {
    try{
        
        //read '.dsbmignore' line by line
        let ignore = [];
        if(fs.existsSync(curDir + '/' + '.dsbmignore'))
            ignore = fs.readFileSync(curDir + '/' + '.dsbmignore', 'utf-8').split('\n').filter(Boolean);
        
        // traverse working directory
        let files = traverse(curDir, ignore);

        // zip up
        let output = fs.createWriteStream(curDir + '/'+curDir.split(path.sep).pop() +'.zip');
        let archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        // pipe archive data to the file
        archive.pipe(output);

        for(let i=0; i < files.length; i++)
        {
            if(path.basename(files[i]) !== curDir.split(path.sep).pop() +'.zip')
                archive.append(fs.createReadStream(files[i]), 
                {name: path.relative(process.cwd(), files[i])});
        }

        archive.finalize();
        // 'close' event is fired only when a file descriptor is involved
        output.on('close', function() {
            console.log('compressed ' + archive.pointer() + ' total bytes');
            // upload file to remote server, send zip and .dsbm
            const zipFile = curDir.split(path.sep).pop() +'.zip';
            upload_(zipFile);
            upload_(PROOF);
            upload_(IDENTITY);
        });

        output.on('end', function() {
            console.log('Data has been drained');
        });

        archive.on('error', function(err) {
            throw err;
        });
    }catch(err)
    {
        console.log(err);
    };
}

function status(){
    let ignore = [];
    if(fs.existsSync(curDir + '/' + '.dsbmignore'))
        ignore = fs.readFileSync(curDir + '/' + '.dsbmignore', 'utf-8').split('\n').filter(Boolean);
    
    let files = traverse(curDir, ignore);
    for(let i=0; i < files.length; i++)
    {
        console.log('   file: ' + files[i]);
    }
}

function upload_(filename)
{
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

module.exports = {init, submit, upload, status, upload_};


