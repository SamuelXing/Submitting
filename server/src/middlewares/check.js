module.exports = 
{
	checkNotLogin: function checkNotLogin(req, res, next)
	{
		if(req.session.user){
			return res.redirect('back');
		}							
		next();
	}
};
