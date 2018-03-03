const Web3 = require('web3')
const fs = require('fs')

// set provider
if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// get transaction by txn number
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
		let lines = fs.readFileSync(log, 'utf-8').split('\n');
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
	let verified = true;
	let report = [];
	if(log.length === 0 || person === null) return verified;
	for(let i in log)
	{
		let txn = await getTxn(log[i][0]);
		if(txn === null || txn.from.toUpperCase() !=  person.account_address.toUpperCase() || txn.input.indexOf(log[i][1].slice(2,)) === -1){
			verified = false;
		}
		report.push(''+log[i]+'\t'+verified+'\n');
	}
	return report;	
}

// verify
async function verify(logFile, infoFile)
{
	// read log.txt
	let logData = readLog(logFile);
	// read personal info file
	let person = readInfo(infoFile);
	let report = await _verify(logData, person);
	console.log(report)
}

// ------<test>-----
//verify('log.txt', 'personal.json')

module.exports = verify




