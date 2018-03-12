const QuestionModel = require('../models/question');

module.exports = 
{
	checkLogin: function checkLogin(req, res, next)
	{
		console.log('Login');
		console.log(req.session.user);
		if(!req.session.user)
		{
			req.flash('error', 'you have to sign in first')
			return res.redirect('/signin');
		}
		next();
	},

	checkNotLogin: function checkNotLogin(req, res, next)
	{
		console.log('Not Login');
		console.log(req.session.user);
		if(req.session.user){
			req.flash('error', 'you\'ve already signed in')
			return res.redirect('back');
		}							
		next();
	},

};
