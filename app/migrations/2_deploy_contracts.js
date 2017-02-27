var Token = artifacts.require("./Token.sol");
var MobileEnergy = artifacts.require("./MobileEnergy.sol");

module.exports = function(deployer) {
  return deployer.deploy(TokenMock).then(
    return deployer.deploy(MobileEnergy, TokenMock.address);
  );
};
