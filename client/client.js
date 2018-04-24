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

const datadir = __dirname + '/.dsbm';

let provider = new web3.providers.HttpProvider("http://127.0.0.1:8545");
let sc = new contract(require("./build/contracts/SubmitContract.json"));

sc.setProvider(provider);

async function getContract() {
    return await sc.deployed()
}

// zip up
let output = fs.createWriteStream(__dirname + '/'+__dirname.split(path.sep).pop() +'.zip');
let archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});
// pipe archive data to the file
archive.pipe(output);

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
    fs.writeFile(datadir+'/'+'personal.json', jInfo, function(err){
       if(err) {
           console.log(err);
       } else {
           console.log(datadir+'/personal.json');
       }
    });
    // create log.txt
    fs.close(fs.openSync(datadir + '/' + 'log.txt', 'w'), function (err) {
        if(err) {
            console.log(err);
        } else {
            console.log(datadir+'/'+'log.txt');
        }
    });
}


//check hash value, error check, zip(option),
async function submit(filename) {
    try {
        // file esisted or not, extension check, __dirname: get current dir
        if (!fs.existsSync(__dirname + '/' + filename))
            throw new Error("file does not exist");
        let info = fs.readFileSync(datadir + '/' + 'personal.json', 'utf-8');
        let infoObj = JSON.parse(info)
        // retrieve personal info
        let data = fs.readFileSync(__dirname + '/' + filename, 'utf-8');
        let hashValue = CryptoJS.SHA256(data);
        let hashStr = '0x' + hashValue.toString(CryptoJS.enc.Hex);
        let instance = await getContract();
        let result = await instance.submit(filename, hashStr, {from: infoObj.account_address});
        let record = '' + result.tx + '  ' + hashStr + '\n';
        console.log('Transaction\tFile Hash');
        console.log(record);
        await fs.appendFile(datadir +'/'+ 'log.txt', record, function (err) {
            if (err) throw err;
        });
    }
    catch (err)
    {
        // if err, process
        console.log('ERROR: ' + err);
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
        if(!fs.existsSync(datadir+'/personal.json'))
            throw new Error('has to run init first');
        let dataStream = fs.readFileSync(datadir+'/personal.json');
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

// get all files in cur directory
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
        let ignore;
        if(fs.existsSync(__dirname + '/' + '.dsbmignore'))
            ignore = fs.readFileSync(__dirname + '/' + '.dsbmignore', 'utf-8').split('\n').filter(Boolean);
        
        let files = traverse(__dirname, ignore);
        for(let i=0; i < files.length; i++)
        {
            if(path.basename(files[i]) !== __dirname.split(path.sep).pop() +'.zip')
                archive.append(fs.createReadStream(files[i]), {name: path.relative(process.cwd(), files[i])});
        }
        archive.finalize();

    }catch(err)
    {
        console.log(err);
    };
}

function status(){
    let ignore;
    if(fs.existsSync(__dirname + '/' + '.dsbmignore'))
        ignore = fs.readFileSync(__dirname + '/' + '.dsbmignore', 'utf-8').split('\n').filter(Boolean);
    
    let files = traverse(__dirname, ignore);
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

// 'close' event is fired only when a file descriptor is involved
output.on('close', function() {
    console.log('compressed ' + archive.pointer() + ' total bytes');
    // upload file to remote server, send zip and .dsbm
    const zipFile = __dirname.split(path.sep).pop() +'.zip';
    upload_(zipFile);
    const logFile = '.dsbm/log.txt';
    const personalFile =  '.dsbm/personal.json';
    upload_(logFile);
    upload_(personalFile);
});

output.on('end', function() {
    console.log('Data has been drained');
});

archive.on('error', function(err) {
    throw err;
});

module.exports = {init, submit, upload, status, upload_};


