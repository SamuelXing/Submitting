var SubmitContract = 
artifacts.require("./SubmitContract.sol");

module.exports = function(deployer, network, accounts){
	if(network == "eth"){
		deployer.deploy(SubmitContract, {
			from: "0xab20caec696b2a10b4e7f213ca06814cacc1bd9c", 
			gas: 3282879,
		});
	}
	else{
		deployer.deploy(SubmitContract, {
			gas: 1000000000,
		});
	}
};
