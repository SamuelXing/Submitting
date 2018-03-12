const marked = require('marked');
const Question = require('../lib/mongo').Question;

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
                        .contentToHtml()
                        .exec();
    },

    // get all questions
    getQuestions: function getQuestions(author)
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
                        .contentToHtml()
                        .exec();
    },

    // increase pv
    incPv: function incPv(questionId)
    {
        return Question.update({_id: questionId}, {$inc: {pv: 1}}).exec();
    }
};





