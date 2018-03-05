module.exports = {
	port: 8080,
	session: {
		secret: 'dsbm',
		key: 'dsbm',
		maxAge: 2592000000,
	},
	mongodb: 'mongodb://localhost:27017/bck-dev'
};
