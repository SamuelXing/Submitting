const marked = require('marked');
const Question = require('../lib/mongo').Question;
const AnswerModel = require('./answer');

// convert content to html
Question.plugin('contentToHtml',{
    afterFind: function(questions)
    {
        return questions.map(function(question){
            question.content = marked(question.content);
            return question;
        });
    },

    afterFindOne: function(question){
        if(question){
            question.content = marked(question.content);
        }
        return question;
    }
});

// add answerCount
Question.plugin('addAnswersCount', {
    afterFind: function(questions)
    {
        return Promise.all(questions.map(function(question){
            return AnswerModel.getAnswersCount(question._id)
                .then(function(answersCount){
                    question.answersCount = answersCount;
                    return question;
                });
        }));
    },

    afterFindOne: function(question)
    {
        if(question)
        {
            return AnswerModel.getAnswersCount(question._id)
                    .then(function(count){
                        question.answersCount = count;
                        return question;
                    });
        }
        return question;
    }
});

module.exports = {
    // Create a new post
    create: function create(question) {
        return Question.create(question).exec();
    },

    // get question by id
    getQuestionById: function getQuestionById(questionId){
        return Question.findOne({_id: questionId})
                        .populate({path: 'author', model: 'User'})
                        .addCreatedAt()
                        .addAnswersCount()
                        .contentToHtml()
                        .exec();
    },

    // get questions by authorId
    getQuestionsByAuthor: function getQuestions(author)
    {
        return Question.find({author: author})
                        .populate({path:'author', model: 'User'})
                        .sort({_id: -1})
                        .contentToHtml()
                        .exec();
    },

    // get all questions
    getAllQuestions: function getQuestions(author)
    {
        let query = {};
        if(author)
        {
            query.author = author;
        }
        return Question.find(query)
                        .populate({path:'author', model: 'User'})
                        .sort({_id: -1})
                        .addCreatedAt()
                        .addAnswersCount()
                        .exec();
    },

    // update question receipt
    updateReceiptByQuestionId: function updateReceiptByQuestionId(questionId, receipt, value){
        return Question.update({_id: questionId}, {$set: {receipt: receipt, value: Number(value)}}).exec();
    },

    // update question close status
    updateSolvedByQuestionId: function updateSolvedByQuestionId(questionId)
    {
        return Question.update({_id: questionId}, {$set: {solved: 1}}).exec();
    },

    // increase pv
    incPv: function incPv(questionId)
    {
        return Question.update({_id: questionId}, {$inc: {pv: 1}}).exec();
    },

    // del question by Id
    delQuestionById: function delQuestionById(questionId, author)
    {
        return Question.remove({author: author, _id: questionId})
                .exec()
                .then(function(res){
                    if(res.result.ok && res.result.n > 0 ){
                        return AnswerModel.delAnswersByQuestiontId(questionId);
                    }
                })
    }
};





