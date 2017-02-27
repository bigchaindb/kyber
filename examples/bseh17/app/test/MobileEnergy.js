var MobileEnergy = artifacts.require('./MobileEnergy.sol');

contract('MobileEnergy', function(accounts) {
  const oracleAddress = accounts[0];
  const sellerAddress = accounts[1];
  const buyerAddress = accounts[2];

  it('should work',function() {
    return MobileEnergy.deployed()
      .then(function(instance) {
        return instance.publishOffer(100, 15, {from: sellerAddress})
          .then(function() {
            return instance.acceptOffer(sellerAddress, {from: buyerAddress})
          })
          .then(function(tx) {
            assert.equal('NewContract', tx.logs[0].event);
            return instance.close(tx.logs[0].args.hash, 12345, 12345678, {from: oracleAddress})
          })
          .then(function(tx) {
            assert.equal('NewInvoice', tx.logs[0].event);
            return instance.withdraw(tx.logs[0].args.hash, {from: sellerAddress})
          });
      });
  });
});
