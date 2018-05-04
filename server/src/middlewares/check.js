const QuestionModel = require('../models/question');

module.exports = 
{
	checkLogin: function checkLogin(req, res, next)
	{
		if(!req.session.user)
		{
			req.flash('error', 'you have to sign in first')
			return res.redirect('/signin');
		}
		next();
	},

	checkNotLogin: function checkNotLogin(req, res, next)
	{
		if(req.session.user){
			req.flash('error', 'you\'ve already signed in')
			return res.redirect('back');
		}							
		next();
	},

	isAdmin: function isAdmin(req, res, next)
	{
		if(!req.session.user)
		{
			req.flash('error', 'you have to sign in first')
			return res.redirect('/signin');
		}

		if(!req.session.user.isAdmin)
		{
			req.flash('error', 'you have no permission to access this page')
			return res.redirect('/signin');
		}

		next();
	},

};
