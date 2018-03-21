var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
	if(network == "eth"){
		deployer.deploy(Migrations, {
			from: "0xab20caec696b2a10b4e7f213ca06814cacc1bd9c",
			gas: 3282879,			
		});
	}
	else{
  	deployer.deploy(Migrations);
	}
};
