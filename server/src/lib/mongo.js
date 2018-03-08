const config = require('config-lite')(__dirname);
const Mongolass = require('mongolass');
const mongolass = new Mongolass();
mongolass.connect(config.mongodb);

console.log(config.mongodb);

exports.User = mongolass.model('User', {
    username: {type: 'string'},
    password: {type: 'string'},
    avatar: {type: 'string' },
    suid: {type: 'string' },
    email: {type: 'string'}
});

exports.User.index({username:1}, {unique: true}).exec();
