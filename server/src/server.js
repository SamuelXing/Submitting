const WebSocketServer = require('ws').Server;
const express = require('express');
const fs = require('fs');
const util = require('util');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const events = require('events');
const ansi = require('ansi');
const _ = require('lodash');
const routes = require('./routes');
const flash = require('connect-flash');
const config = require('config-lite')(__dirname);
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cursor = ansi(process.stdout);

process.setMaxListeners(0);

// WebSocket
function BandwidthSampler (ws, interval) {
    interval = interval || 2000;
    let previousByteCount = 0;
    let self = this;
    let intervalId = setInterval(function () {
        let byteCount = ws.bytesReceived;
        let bytesPerSec = (byteCount - previousByteCount) / (interval / 1000);
        previousByteCount = byteCount;
        self.emit('sample', bytesPerSec);
    }, interval);
    ws.on('close', function () {
        clearInterval(intervalId);
    });
}

util.inherits(BandwidthSampler, events.EventEmitter);

function makePathForFile (filePath, prefix, cb) {
    if (typeof cb !== 'function') throw new Error('callback is required');
    filePath = path.dirname(path.normalize(filePath)).replace(/^(\/|\\)+/, '');
    let pieces = filePath.split(/(\\|\/)/);
    let incrementalPath = prefix;
    function step (error) {
        if (error) return cb(error);
        if (pieces.length === 0) return cb(null, incrementalPath);
        incrementalPath += '/' + pieces.shift();
        fs.access(incrementalPath, function (err) {
            if (err) fs.mkdir(incrementalPath, step);
            else process.nextTick(step);
        });
    }
    step();
}

cursor.eraseData(2).goto(1, 1);

let clientId = 0;
let wss = new WebSocketServer({server: server});

wss.on('connection', function (ws) {
    let thisId = ++clientId;
    cursor.goto(1, 4 + thisId).eraseLine();
    console.log('Client #%d connected', thisId);

    let sampler = new BandwidthSampler(ws);
    sampler.on('sample', function (bps) {
        cursor.goto(1, 4 + thisId).eraseLine();
        console.log('WebSocket #%d incoming bandwidth: %d MB/s', thisId, Math.round(bps / (1024 * 1024)));
    });

    let filesReceived = 0;
    let currentFile = null;
    ws.on('message', function (data) {
        if (typeof data === 'string') {
            currentFile = JSON.parse(data);
            // note: a real-world app would want to sanity check the data
        } else {
            if (currentFile == null) return;
            makePathForFile(currentFile.path, path.join(__dirname, '/uploaded'), function (error, path) {
                if (error) {
                    console.log(error);
                    ws.send(JSON.stringify({event: 'error', path: currentFile.path, message: error.message}));
                    return;
                }
                fs.writeFile(path + '/' + currentFile.name, data, function (error) {
                    if (error) {
                        console.log(error);
                        ws.send(JSON.stringify({event: 'error', path: currentFile.path, message: error.message}));
                        return;
                    }
                    ++filesReceived;
                    // console.log('received %d bytes long file, %s', data.length, currentFile.path);
                    ws.send(JSON.stringify({event: 'complete', path: currentFile.path}));
                    currentFile = null;
                });
            });
        }
    });

    ws.on('close', function () {
        cursor.goto(1, 4 + thisId).eraseLine();
        console.log('Client #%d disconnected. %d files received.', thisId, filesReceived);
    });

    ws.on('error', function (e) {
        cursor.goto(1, 4 + thisId).eraseLine();
        console.log('Client #%d error: %s', thisId, e.message);
    });
});

fs.mkdir(path.join(__dirname, '/uploaded'), function () {
    // ignore errors, most likely means directory exists
    console.log('Uploaded files will be saved to %s/uploaded.', __dirname);
    console.log('Remember to wipe this directory if you upload lots and lots.');
    server.listen(config.port, function () {
        console.log('Listening on http://localhost:8080');
    });
});

// express
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public/image')));
app.use(express.static(path.join(__dirname, '/uploaded')));

// set template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// session middleware
app.use(session({
    name: config.session.key,
    secret: config.session.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: config.session.maxAge
    },
    store: new MongoStore({
        url: config.mongodb
    })
}));

app.use(flash());

// form handling middleware
app.use(require('express-formidable')({
    keepExtensions: true // keep extension
  }));

// set template global variable
app.use(function(req, res, next){
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
});

//router
routes(app);

// app.get('/files', function(req, res)
// {
//     let currentDir  = path.join(__dirname, '/uploaded');
//     let query = req.query.path || '';
//     if(query) cur = path.join(dir, query);
//     console.log('browsing ', currentDir);
//     fs.readdir(currentDir, function(err, files)
//     {
//         if(err)
//         {
//             throw err;
//         }
//         let data = [];
//         files.forEach(function (file)
//         {
//             try
//             {
//                 let isDirectory = fs.statSync(path.join(currentDir,file)).isDirectory();
//                 if(isDirectory)
//                 {
//                     data.push({ Name : file, IsDirectory: true, Path : path.join(query, file)});
//                 } else 
//                 {
//                     let ext = path.extname(file);
//                     data.push({ Name : file, Ext : ext, IsDirectory: false, Path : path.join(query, file) });
//                 }
//             }catch(e)
//             {
//                 console.log(e);
//             }
//         });
//         data = _.sortBy(data, function(f) { return f.Name });
//         res.json(data);
//     });
// });




