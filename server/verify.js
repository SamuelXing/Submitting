const Web3 = require('web3')
const fs = require('fs')

// set provider
if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}


async function getTxn(txnNum){
	try{
		var txn = await web3.eth.getTransaction(txnNum);
		return txn;
	}
	catch(err){
		console.log(err);
	}
}

// read log file, sync read
function readLog(log){
	try{
		let rst = [];
		let logData = fs.readFileSync(log, 'utf-8');
		// regex to split log file
		let lines = logData.split(/^(.*?)\n/);
		for(let i in lines)
		{
			if(lines[i] === "") continue
			rst.push(lines[i].trim().split(/\s+/));
		}
		return rst;
	}
	catch(err)
	{
		console.log(err)
	}
}

// read personal info
function readInfo(infoFile)
{
	try{
		let personData = fs.readFileSync(infoFile, 'utf-8');	
		return JSON.parse(personData);
	}
	catch(err)
	{
		console.log(err)
	}
}

// verify log data
async function _verify(log, person)
{	
	var verified = false;
	if(log.length === 0 || person === null) return verified;
	for(let i in log)
	{
		let txn = await getTxn(log[i][0]);
		if(txn === null || txn.from !==  person.account || txn.input.indexOf(log[i][1].slice(2,)) === -1){
			verified = false;
			return verified
		}
	}
	verified = true;
	return verified;	
}

function verify(logFile, infoFile)
{
	// read log.txt
	let logData = readLog(logFile);
	// read personal info file
	let person = readInfo(infoFile);
	if(_verify(logData, person))
	{
		console.log('data verified');
	}
	else
	{
		console.log('not pass');
	}
}

verify('log.txt', 'personal.json')


