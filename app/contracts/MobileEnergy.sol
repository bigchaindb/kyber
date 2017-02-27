pragma solidity ^0.4.6;

import './BSToken.sol';

contract MobileEnergy {
  Token private token;

  struct Seller {
    uint256 price;
    uint256 power;
  }
  mapping(address => Seller) public sellers;

  struct Contract {
    address seller;
    address buyer;
    uint256 price;
    uint32 timestamp;
  }
  mapping(bytes32 => Contract) public contracts;
  mapping(address => bytes32[]) public users2contracts;

  struct Invoice {
    bytes32 contractHash;
    uint256 amount;
    uint32 timestamp;
    bool isPaid;
  }
  mapping(bytes32 => Invoice) public invoices;
  mapping(address => bytes32[]) public users2invoices;


  event NewContract(bytes32 hash);

  function MobileEnergy(Token _token)
  {
    token = _token;
  }

  function publishOffer(uint256 _price, uint256 _power)
  {
    sellers[msg.sender] = Seller(_price, _power);
  }

  function acceptOffer(address _seller, address _buyer, uint256 _price, uint32 _timestamp)
  returns (Contract _contract)
  {
    _contract = Contract(_seller, _buyer, _price, _timestamp);
    bytes32 _contractHash = keccak256(_contract);
    contracts[_contractHash] = _contract;
    users2contracts[_seller].push(_contractHash);
    users2contracts[_buyer].push(_contractHash);

    NewContract(_contractHash);
  }

  function invoice(bytes32 _contractHash, uint256 _amount, uint32 _timestamp)
  returns (Invoice _invoice)
  {
    // What if a seller changes the price while buyer is using a plug?
    uint256 _total = _amount * contracts[_contractHash].price;
    _invoice = Invoice(_contractHash, _amount, _timestamp);
    bytes32 _invoiceHash = keccak256(_invoice);

    _invoice.isPaid = token.transferFrom(_buyer, _seller, _total);

    invoices[_invoiceHash] = _invoice;
    users2invoices[_seller].push(_invoiceHash);
    users2invoices[_buyer].push(_invoiceHash);
  }

  function withdraw(bytes32 _invoiceHash) returns (bool _success)
  {
    Invoice _invoice = invoices[_invoiceHash];
    if (_invoice.isPaid) {
      throw;
    }

    Contract _contract = contracts[_invoice.contractHash];
    uint256 _total = _invoice.amount * _contract.price;
    _invoice.isPaid = token.transferFrom(_contract.buyer, _contract.seller, _total);
  }
}
