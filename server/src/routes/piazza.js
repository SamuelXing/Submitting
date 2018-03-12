const express = require('express')
const router = express.Router();

const checkLogin = require('../middlewares/check').checkLogin;
const QuestionModel = require('../models/question');

// GET /piazza?author = xxx
router.get('/', function(req, res, next){
    const author = req.query.author;
    QuestionModel.getQuestions(author).then(function(questions){
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
router.get('/create', checkLogin, function(req, res, next){
    res.render('create');
});

// GET /piazza/:questionID
router.get('/:questionId', function(req, res, next){
    const questionId = req.params.questionId;

    Promise.all([
        QuestionModel.getQuestionById(questionId),
        QuestionModel.incPv(questionId)
    ])
    .then(function(result){
        const question = result[0];
        if(!question){
            throw new Error('this question does not exist');
        }

        res.render('question', {question: question});
    }).catch(next);
});

// GET /piazza/:questionID/edit
router.post('/:questionId/edit', checkLogin, function(req, res, next){
    res.send('dummy');
});

// POST /piazza/:questionId/comment
router.post('/:questionId/comment', checkLogin, function(req, res, next){
    res.send('dummy');
});

// GET /piazza/:questionId/comment/edit
router.get('/:questionId/comment/:commentId/edit', checkLogin, function(req, res, next){
    res.send('dummy');
});

module.exports = router;

