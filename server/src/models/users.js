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
	}
};
