const marked = require('marked');
const Answer = require('../lib/mongo').Answer;

// convert markdown to html
Answer.plugin('contentToHtml', {
    afterFind: function (answers) {
        return answers.map(function (answer) {
        answer.content = marked(answer.content);
        return answer;
        });
    }
});

module.exports = {
    // create an answer
    create: function create(answer)
    {
        return Answer.create(answer).exec();
    },

    // delete an answer by userId and answerId
    delAnswerById: function delAnswerById(answerId, author)
    {
        return Answer.remove({ author: author, _id: answerId}).exec();
    },

    // delete all answers by questionId
    delAnswersByQuestiontId: function delAnswersByQuestionId(questionId)
    {
        return Answer.remove({questionId: questionId}).exec();
    },

    // get all answers by questionsId
    getAnswers: function getAnswers(questionId)
    {
        return Answer.find({questionId: questionId})
                    .populate({path: 'author', model: 'User'})
                    .sort({_id: 1})
                    .addCreatedAt()
                    .contentToHtml()
                    .exec();
    },

    // get answer numbers
    getAnswersCount: function getAnswerCount(questionId)
    {
        return Answer.count({questionId: questionId}).exec();
    },

    // upvote
    upvote: function upvote(answerId)
    {
        return Answer.update({_id: answerId}, { $inc: { votes: 1}}).exec();
    },

    // get an answer by Id
    getAnswerById: function getAnswerById(answerId)
    {
        return Answer.findOne({_id: answerId})
                    .populate({path: 'author', model: 'User'})
                    .populate({path: 'questionId', model: 'Question'})
                    .exec();
    },

    // add voter
    addVoter: function addVoter(answerId, voterId)
    {
        return Answer.update({_id: answerId}, {$push: { voters: voterId}}).exec();
    },

    // query voters
    queryVoter: async function queryVoter(answerId, voterId)
    {
        const answer = await Answer.findOne({_id: answerId});
        if(typeof answer.voters === 'undefined')
        {
            return false;
        }
        if(answer.voters.map(String).indexOf(voterId)!=-1)
        {
            return true;
        }
        else
        {
            return false;
        }
    },

    // update choosed
    updateChoosed: function updateChoosed(answerId, txnHash)
    {
        return Answer.update({_id: answerId}, {$set: {choosed: txnHash}}).exec();
    }
};
  