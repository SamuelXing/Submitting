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

// const checkNotLogin = require('../middlewares/check').checkNotLogin;

async function getLatestBlockNumber()
{
	try{
		// get the highest block
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

router.get('/:blockId', async function(req, res, next){
	let blockId = req.params.blockId;
	let latest = await web3.eth.getBlockNumber();
	// if block numer greater than the highest
    if(blockId > latest){
	   res.render('bck_detail', {message: {
					valid: false, 
					msg: "This block is currently not mined."},
					block: {}});
	}
	// if block number less than 0
	else if(blockId < 0){
		res.render('bck_detail', {message: {
					valid: false, 
					msg: "Invalid block number."},
					block: {}});
	}
	else{
		let block = await web3.eth.getBlock(blockId);	
		res.render('bck_detail', {message: {
					valid: true, 
					msg: "valid"},
					block: block});
	}
});

router.get('/', function(req, res, next){
	res.render('blocks');
})

router.get('/api/getpage/:pageId', async function(req, res, next){
	let blocks = [];
	const pageId = req.params.pageId;
	const latest = await getLatestBlockNumber();
	for(let i=latest - (pageId - 1) * 20; i> latest-pageId * 20; i--)
	{
		let block = await getBlockContent(i);
		blocks.push(block);
	}
	res.status(200).send(blocks);
})

module.exports = router;
