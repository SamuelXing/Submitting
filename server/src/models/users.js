const User = require('../lib/mongo').User;

module.exports = {
	// register a user
	create: function create(user){
		return User.create(user).exec();
	},

	// get user by name
	getUserByName: function getUserByName(username)
	{
		return User.findOne({username: username})
				.addCreatedAt()
				.exec();
	},

	// get user by Id
	getUserById: function getUserById(id)
	{
		return User.findOne({_id: id}).exec();
	}
};
