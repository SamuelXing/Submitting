const Web3 = require('web3')
const fs = require('fs')

// set provider
if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
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
async function _verify(PROOF, IDENTITY)
{	
	let verified = true;
	let report = [];
	if(PROOF.length === 0 || IDENTITY === null) return verified;
	for(let i in PROOF)
	{
		let txn = await getTxn(PROOF[i][0]);
		if(txn === null 
			|| txn.from.toUpperCase() !=  IDENTITY.account_address.toUpperCase() 
			|| txn.input.indexOf(PROOF[i][1].slice(2,)) === -1)
			// hash the file, check if it is match the fileHash
			// get the timestamp
			{
			verified = false;
		}
		report.push(''+PROOF[i]+'\t'+verified+'\n');
	}
	return report;	
}

// verify
async function verify(PROOF, IDENTITY)
{
	// read PROOF
	let PROOFData = readPROOF(PROOF);
	// read IDENTITY info file
	let IDENTITYData = readIDENTITY(IDENTITY);
	let report = await _verify(PROOFData, IDENTITYData);
	console.log(report)
}

// ------<test>-----
verify('PROOF', 'IDENTITY')

//module.exports = verify




