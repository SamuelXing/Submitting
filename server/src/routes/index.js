module.exports = function(app){
	app.get('/', function(req, res) {
		res.redirect('/home');
	});
	app.use('/signup', require('./signup'));
	app.use('/signin', require('./signin'));
	app.use('/signout', require('./signout'));
	app.use('/admin', require('./admin'));
	app.use('/transactions', require('./transactions'));
	app.use('/blocks', require('./blocks'));
	app.use('/home', require('./home'));
	app.use('/piazza', require('./piazza'));
	//app.use('/files', require('./files'));
};
