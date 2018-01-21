
const Websocket = require('ws');
const fs = require('fs');

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

function upload(filename) {
    let path = __dirname + '/' + filename;
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


