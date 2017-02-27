pragma solidity ^0.4.6;

import './Token.sol';

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
  event NewInvoice(bytes32 hash);

  function MobileEnergy(Token _token)
  {
    token = _token;
  }

  function publishOffer(uint256 _price, uint256 _power)
  {
    sellers[msg.sender] = Seller(_price, _power);
  }

  function acceptOffer(address _seller, address _buyer, uint256 _price, uint32 _timestamp)
  returns (bytes32 _contractHash)
  {
    Contract memory _contract = Contract(_seller, _buyer, _price, _timestamp);
    _contractHash = calculateContractHash(_contract);
    contracts[_contractHash] = _contract;
    users2contracts[_seller].push(_contractHash);
    users2contracts[_buyer].push(_contractHash);

    NewContract(_contractHash);
  }

  function close(bytes32 _contractHash, uint256 _amount, uint32 _timestamp)
  returns (bytes32 _invoiceHash)
  {
    Contract _contract = contracts[_contractHash];
    uint256 _total = _amount * _contract.price;
    Invoice memory _invoice = Invoice(_contractHash, _amount, _timestamp, false);
    _invoiceHash = calculateInvoiceHash(_invoice);

    _invoice.isPaid = token.transferFrom(_contract.buyer, _contract.seller, _total);

    invoices[_invoiceHash] = _invoice;
    users2invoices[_contract.seller].push(_invoiceHash);
    users2invoices[_contract.buyer].push(_invoiceHash);

    NewInvoice(_invoiceHash);
  }

  function withdraw(bytes32 _invoiceHash)
  returns (bool _success)
  {
    Invoice _invoice = invoices[_invoiceHash];
    if (_invoice.isPaid) {
      throw;
    }

    Contract _contract = contracts[_invoice.contractHash];
    uint256 _total = _invoice.amount * _contract.price;
    _invoice.isPaid = token.transferFrom(_contract.buyer, _contract.seller, _total);
  }

  function calculateContractHash(Contract _contract)
  internal
  returns (bytes32 hash)
  {
    hash = keccak256(_contract.seller, _contract.buyer,
                     _contract.price, _contract.timestamp);
  }

  function calculateInvoiceHash(Invoice _invoice)
  internal
  returns (bytes32 hash)
  {
    hash = keccak256(_invoice.contractHash, _invoice.amount, _invoice.timestamp);
  }
}
