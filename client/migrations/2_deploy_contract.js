var SubmitContract = 
artifacts.require("./SubmitContract.sol");

module.exports = function(deployer){
	deployer.deploy(SubmitContract, {
		gas: 1000000000,
	});
};
