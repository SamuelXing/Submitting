const express = require('express');
const router = express.Router();
const Web3 = require('web3')

// set provider
if (typeof web3 !== 'undefined') {
	var web3 = new Web3(web3.currentProvider);
} else {
	// set the provider
	var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

const checkNotLogin = require('../middlewares/check').checkNotLogin;

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

// homepage
router.get('/', async function(req, res, next){
	let blocks = [];
	let txns = [];
	let latest = await getLatestBlockNumber();
	if(latest < 10)
	{
		for(let i=latest; i>=0;i--)
		{
			let block = await getBlockContent(i);
			for(let txn of block.transactions) 
			{
				let txnContent = await getTxn(txn);
				txns.push(txnContent);
			}
			blocks.push(block);
		}
	}
	else
	{
		for(let i=latest; i>0; i--)
		{
			if(blocks.length >= 10 && txns.length >= 10){
				break;
			}
			let block = await getBlockContent(i);
			if(blocks.length <= 10)
			{
				blocks.push(block);
			}
			if(block.transactions != null){
				for(let txn of block.transactions)
				{
					let txnContent = await getTxn(txn);
					if(txns.length <= 10)
						txns.push(txnContent);
				}
			}
		}
	}
	res.render('home', {blocks: blocks, txns:txns});
});

module.exports = router;

