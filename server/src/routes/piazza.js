const express = require('express')
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
       const transaction = await web3.eth.getTransaction(txnHash);
       return transaction;
    }
    catch(error){
        console.log(error);
    }
}

const checkLogin = require('../middlewares/check').checkLogin;
const QuestionModel = require('../models/question');
const AnswerModel = require('../models/answer');

// GET /piazza?author = xxx
router.get('/', function(req, res, next){
    QuestionModel.getQuestions("").then(function(questions){
        req.session.questions = questions;
        res.render('piazza', {questions: questions});
    }).catch(next);
});

// POST /publish
router.post('/', checkLogin, function(req, res, next){
    const author = req.session.user._id;
    const title = req.fields.title;
    const content = req.fields.content;

    // check parameter
    try{
        if(!title.length)
        {
            throw new Error('title required');
        }
        if(!content.length)
        {
            throw new Error('content required');
        }
    } catch(error)
    {
        req.flash('error', error.message);
        return res.redirect('back');
    }

    let question = 
    {
        author: author,
        title: title,
        content: content,
        pv: 0
    };

    // new question post
    QuestionModel.create(question)
    .then(function(result)
    {
       question = result.ops[0];
       req.flash('success', 'new post created!');
       res.redirect(`/piazza/${question._id}`); 
    })
    .catch(next);
});

// GET /piazza/create
router.get('/create', checkLogin, async function(req, res, next){
    const questions = await QuestionModel.getQuestions("");
    res.render('create', {questions: questions});
});

// GET /piazza/:questionID
router.get('/:questionId',async function(req, res, next){
    const questionId = req.params.questionId;
    const questions = await QuestionModel.getQuestions("");
    Promise.all([
        QuestionModel.getQuestionById(questionId),
        AnswerModel.getAnswers(questionId),
        QuestionModel.incPv(questionId)
        
    ])
    .then(function(result){
        const question = result[0];
        const answers = result[1];
        if(!question){
            throw new Error('this post does not exist');
        }

        res.render('question', {questions: questions, question: question, answers: answers});
    }).catch(next);
});

// GET /piazza/:questionID/edit
router.post('/:questionId/edit', checkLogin, function(req, res, next){
    res.send('dummy');
});

// POST /piazza/:questionId/comment
router.post('/:questionId/answer', checkLogin, function(req, res, next){
   const author = req.session.user._id;
   const questionId = req.params.questionId;
   const content = req.fields.content;
   let answer = 
   {
        author: author,
        content: content,
        questionId: questionId,
        votes: 0,
        closed: 1
   };

   AnswerModel.create(answer).then(function(){
       res.redirect('back');
   }).catch(next);

});

// GET /piazza/:questionId/comment/edit
router.get('/:questionId/comment/:commentId/edit', checkLogin, function(req, res, next){
    res.send('dummy');
});

// GET ajax test
router.get('/api/upvote', checkLogin, function(req, res, next){
    res.send('dummy');
})


// POST /piazza/api/upvote
router.post('/api/upvote/:answerId', checkLogin, async function(req, res, next){
    const result = await AnswerModel.queryVoter(req.params.answerId, req.session.user._id);
    // has already voted
    if(result)
    {
        res.status(400).send('you have voted');
    }
    else
    {
        await AnswerModel.upvote(req.params.answerId);
        await AnswerModel.addVoter(req.params.answerId, req.session.user._id);
        
        AnswerModel.getAnswerById(req.params.answerId).then(function(answer){
            res.send(''+answer.votes);
        });
    } 
})

// GET ajax test
router.get('/api/pay/:qeustionId', checkLogin, function(req, res, next){
    res.send('dummy');
})

// POST /piazza/api/:questionId/pay
router.post('/api/pay', checkLogin, async function(req, res, next){
    const postId  = req.fields.postId;
    const receipt = req.fields.receipt;
    const txn = await getTxn(receipt);
    res.contentType('json');
    res.status(200).send(JSON.stringify({data: txn.value}));
})

module.exports = router;

