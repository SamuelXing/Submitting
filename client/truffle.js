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
		eth: {
			host: "127.0.0.1",
			port: 8545,
			network_id: "*",
			from: "0xab20caec696b2a10b4e7f213ca06814cacc1bd9c", 
			gas: 3282879, 
		}
	}
};
