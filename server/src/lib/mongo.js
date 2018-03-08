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


console.log(config.mongodb);

exports.User = mongolass.model('User', {
    username: {type: 'string'},
    password: {type: 'string'},
    avatar: {type: 'string' },
    suid: {type: 'string' },
    email: {type: 'string'}
});

exports.User.index({username:1}, {unique: true}).exec();
