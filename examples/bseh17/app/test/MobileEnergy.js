var MobileEnergy = artifacts.require('./MobileEnergy.sol');

contract('MobileEnergy', function(accounts) {
  it('should publish an offer',function() {
    return MobileEnergy.deployed()
    .then(function(instance) {
      return instance.publishOffer.call({from:accounts[0],_price: 100, _power: 15});
    })
    .then(function() {
      //assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");

    });
  });
  it('should accept an offer');
  it('should close a contract');
  it('should withdraw funds from a contract');
});
