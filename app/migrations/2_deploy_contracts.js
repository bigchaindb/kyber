var Token = artifacts.require("./Token.sol");
var MobileEnergy = artifacts.require("./MobileEnergy.sol");

module.exports = function(deployer) {
  deployer.deploy(Token);
  deployer.deploy(MobileEnergy);
};
