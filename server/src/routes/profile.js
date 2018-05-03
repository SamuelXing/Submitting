const express = require('express')
const router = express.Router();
const Web3 = require('web3')
const checkLogin = require('../middlewares/check').checkLogin;
const UserModel = require('../models/users');
const QuestionModel = require('../models/question');
const AnswerModel = require('../models/answer');

// set provider
if (typeof web3 !== 'undefined') {
	var web3 = new Web3(web3.currentProvider);
} else {
	// set the provider you want from Web3.providers
	var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

async function getBalance(account)
{
    try
    {
        if(account == 'undefined' || account == null) return 0;
        let balance = await web3.eth.getBalance(account);
        console.log(account);
        console.log(balance);
        return balance;
    }catch(err)
    {
        console.log(err);
    }
    
}

// GET profile/:userID 
router.get('/:userID', function(req, res, next){
    let userId = req.params.userID; 
    Promise.all([
        UserModel.getUserById(userId),
        QuestionModel.getQuestionsByAuthor(userId),
        AnswerModel.getAnswersByAuthor(userId),
    ]).then(async function(result){
        let user = result[0];
        let questions = result[1];
        let answers = result[2];
        let balance = await getBalance(user.account);
        res.render('profile', {user: user, questions: questions, answers: answers, balance: balance});
    }).catch(next);
});

module.exports = router;