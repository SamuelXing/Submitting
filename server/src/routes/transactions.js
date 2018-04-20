const express = require('express');
const router = express.Router();
const Web3 = require('web3')

// set provider
if (typeof web3 !== 'undefined') {
	var web3 = new Web3(web3.currentProvider);
} else {
	// set the provider you want from Web3.providers
	var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

async function getLatestBlockNumber()
{
	try{
		const number = await web3.eth.getBlockNumber();
		return number;
	}catch(error)
	{
		console.log(error);
	}
}

async function getBlockContent(blockNum)
{
	try{
		const info = await web3.eth.getBlock(blockNum);
		return info;
	}catch(error)
	{
		console.log(error);
	}
}

async function getBckTxnCount(blockNum)
{
	try{
		const number =  web3.eth.getBlockTransactionCount(blockNum);
		return number;
	}catch(error)
	{
		console.log(error);
	}
}

async function getTxn(hash)
{
	try
	{
		const transaction = web3.eth.getTransaction(hash);
		return transaction;
	}catch(error)
	{
		console.log(error);
	}
}

router.get('/:transactionID', async function(req, res, next){
    const transactionId = req.params.transactionID;
    const txnContent = await getTxn(transactionId);
    // check if transaction exist
    res.render('txn_detail', {txn: txnContent});
});

router.get('/', function(req, res, next){
	res.render('txns');
})

router.get('/api/getpage/:startId', async function(req, res, next){
    let txns = [];
    let curBlock = req.params.startId;
    let latest = 0;
    if(curBlock <= 0)
        latest = await getLatestBlockNumber();
    else
        latest = curBlock;
	for(curBlock =latest; curBlock >= 0; curBlock--)
	{
		blockContent = await getBlockContent(curBlock);
		for(let txn of blockContent.transactions) 
        {
            let txnContent = await getTxn(txn);
            txns.push(txnContent);
        }
        if(txns.length === 20)
            break;
        if(txns.length <= 20 && curBlock <= 0)
            break; 
    }
	res.send(JSON.stringify({curBlock: curBlock, txns: txns}));
})


module.exports = router;