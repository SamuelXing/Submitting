const config = require('config-lite')(__dirname);
const Mongolass = require('mongolass');
const mongolass = new Mongolass();
mongolass.connect(config.mongodb);

const moment = require('moment');
const objectIdToTimestamp = require('objectid-to-timestamp');

mongolass.plugin('addCreatedAt', {
    afterFind: function(results) {
        results.forEach(function(item){
            item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
        });
        return results;
    },

    afterFindOne: function(result)
    {
        if(result)
        {
            result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
        }
        return result;
    }
});

mongolass.plugin('addVoter',{
    afterFindOne: function(result, voterId, voterName){
        if(result)
        {
            console.log('HERE');
        }
        return result;
    }
});


console.log(config.mongodb);

exports.User = mongolass.model('User', {
    username: {type: 'string'},
    password: {type: 'string'},
    avatar: {type: 'string' },
    suid: {type: 'string' },
    email: {type: 'string'},
    account: {type: 'string'},
});

exports.Question = mongolass.model('Question', {
    author: {type: Mongolass.Types.ObjectId},
    title: {type: 'string'},
    content: {type: 'string' },
    pv: {type: 'number'},
    receipt: {type: 'string'},
    solved: {type: 'number', default: 0}
});

exports.Answer = mongolass.model('Answer', {
    author: {type: Mongolass.Types.ObjectId},
    content: {type: 'string'},
    questionId: {type: Mongolass.Types.ObjectId},
    voters: [{type: Mongolass.Types.ObjectId}],
    votes: {type: 'number'}
})

exports.User.index({username:1}, {unique: true}).exec();
exports.Question.index({author: 1, _id: -1 }).exec();
exports.Answer.index({questionId: 1, _id: 1}).exec(); // get all answers by questionId
exports.Answer.index({author: 1, _id: 1}).exec(); // delete by user id and author id