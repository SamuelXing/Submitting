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

async function getTxn(txnHash)
{
    try
    {
       const transaction = web3.eth.getTransaction(txnHash);
       return transaction;
    }
    catch(error){
        console.log(error);
    }
}

router.get('/:transactionID', async function(req, res, next){
    const transactionId = req.params.transactionID;
    const txnContent = await getTxn(transactionId);
    // check if transaction exist
    res.render('txn_detail', {txn: txnContent});
});

module.exports = router;