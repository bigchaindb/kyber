// Abstract contract for the full ERC 20 Token standard
// https://github.com/ethereum/EIPs/issues/20
pragma solidity ^0.4.6;

contract TokenMock {
    function transferFrom(address _from, address _to, uint256 _value)
    returns (bool success)
    {
      return false;
    }
}
