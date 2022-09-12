// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage{
    // Counters.Counter is for accessing the counter in counters
    using Counters for Counters.Counter;
    // Creating an instance of struct Counters.Counter
    Counters.Counter private _tokenIds;
    address private _contractAddress;

    constructor(address _marketPlaceAddress) ERC721("Metaverse Tokens","METT"){
        _contractAddress = _marketPlaceAddress;
    }

    // function for minting tokens
    function createToken(string memory _tokenURI) public returns(uint256){
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        // mint,setTokenURI,setApproval

        // _mint(to, tokenId);
        _mint(msg.sender,newItemId);

        // _setTokenURI(tokenId, _tokenURI);
        _setTokenURI(newItemId, _tokenURI);

        // _setApprovalForAll(owner, operator, approved); owner =  msg.sender by default
        setApprovalForAll(_contractAddress,true);

        // For front end functionality 
        return newItemId;

    }

}