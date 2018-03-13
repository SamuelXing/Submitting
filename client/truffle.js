module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
	networks: {
		development: {
			host: "localhost",
			port: 8545,
			network_id: "*",
			gas: 10000000000,
			gasPrice: 1,
		},
		geth: {
			host: "127.0.0.1",
			port: 8545,
			network_id: "*",
			from: "0xbdd396fec43845244dda4af92cb680d07a426f90",
			gas: 3282879, 
		}
	}
};
