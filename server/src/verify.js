const Web3 = require('web3')
const fs = require('fs')
const CryptoJS = require("crypto-js");

const IDENTITY = "IDENTITY";
const PROOF = "PROOF";
const Histoy = "History";

// set provider
if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
}

// traverse working directory
function traverse(dir, map)
{
    files = fs.readdirSync(dir);
    map = map || new Map();
    files.forEach(function(file) {
        if (!fs.statSync(dir + '/' + file).isDirectory()) {
			let timestamp_filename = file.split(/(_)/);
            map.set(timestamp_filename[0], file);
        }
    });
    return map;
}

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

// verify PROOF data
async function _verify(PROOF, IDENTITY, TF_MAP, path)
{	
	try{
		let verified = true;
		// create report file, HERE
		let report = fs.createWriteStream('report.txt', {
			flags: 'a' // 'a' means appending (old data will be preserved)
		});
		if(PROOF.length === 0 || IDENTITY === null) return report;
		for(let i in PROOF)
		{
			let txn = await web3.eth.getTransaction(PROOF[i][0]);
			// make sure data is authentic
			if(txn === null 
				|| txn.from.toUpperCase() !=  IDENTITY.account_address.toUpperCase() 
				|| txn.input.indexOf(PROOF[i][1].slice(2,)) === -1){
				verified = false;
			}
			// get timestamp,
			let block = await web3.eth.getBlock(txn.blockNumber);
			let timestamp = block.timestamp;
			// get filename based on timestamp
			let filename = TF_MAP.get(timestamp.toString());
			if(filename == 'undefined') verified = false;
			// hash the file locally from server
			let data = fs.readFileSync(path + '/' + Histoy + '/' + filename, 'utf-8');
			let hashValue = CryptoJS.SHA256(data);
			let hashStr = hashValue.toString(CryptoJS.enc.Hex);
			// hash the file, check if it is match the fileHash 
			// proof that it is indeed the file you submitted at that time 
			if(txn.input.indexOf(hashStr) === -1){
				verified = false;
			}
			// convert timestamp to human readable date
			let date = new Date(timestamp*1000).toUTCString();
			report.write(date + ', submit ' + filename + ', verified: ' + verified+'\n');
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
		|| !fs.existsSync(path + '/' + PROOF)
		|| !fs.existsSync(path + '/' + Histoy))
		{
			throw new Error('lack of key files, cannot verify');
		}
		// read PROOF
		let PROOFData = readPROOF(path + '/' + PROOF);
		// read IDENTITY info file
		let IDENTITYData = readIDENTITY(path + '/' + IDENTITY);
		// {timestamp, filename} map
		let tf_map = traverse(path + '/' + Histoy);
		// verify
		await _verify(PROOFData, IDENTITYData, tf_map, path);
	}
	catch(err)
	{
		console.log(err);
	}
}

// ------<test>-----
//verify(process.cwd()+'/.dsbm');





