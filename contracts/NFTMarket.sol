// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarket is ReentrancyGuard{
    using Counters for Counters.Counter;
    Counters.Counter private _itemId;
    Counters.Counter private _itemsSold;

    address payable owner;
    // ether translates the 0.025 to its wei amount,ether = matic since we are using polygon for deploying
    uint256 listingPrice = 0.025 ether;
    
    constructor(){
        owner = payable(msg.sender);
    }

    struct MarketItem{
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        // the owner will change from seller/marketplace to buyer when the item is sold
        address payable owner;
        uint256 price;
        bool sold;
    }

    // mapping from item id to marketItem
    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated (
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getListingPrice() public view returns(uint256){
        return listingPrice;
    }

    // payable for listing price non Reentrant prevents loop attacks
    function createMarketItem(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price
    ) public payable nonReentrant{
        require(_price>0,"The price must atleast be 1 wei");
        require(msg.value == listingPrice,"Price must be equal to listing Price!");

        // implement check if msg.sender == ownerOfToken
        require(msg.sender == IERC721(_nftContract).ownerOf(_tokenId),"You don't own the token!");

        _itemId.increment();
        uint256 itemId = _itemId.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            _nftContract,
            _tokenId,
            payable(msg.sender),
            payable(address(0)),
            _price,
            false
        );

        IERC721(_nftContract).transferFrom(msg.sender,address(this),_tokenId);

        emit MarketItemCreated(itemId, _nftContract, _tokenId,msg.sender,address(0),_price,false);
        
    }

    function createMarketSale(
        address _nftContract,
        uint256 itemId
    ) public payable nonReentrant{
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(msg.value == price,"Insufficient funds for purchasing tokens");

        idToMarketItem[itemId].seller.transfer(msg.value);
        IERC721(_nftContract).transferFrom(address(this),msg.sender,tokenId);

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;

        _itemsSold.increment();

        // transfer the listing fee to the owner of the marketPlace
        payable(owner).transfer(listingPrice);
    }

    // Query functions

    function fetchMarketItems() public view returns (MarketItem[] memory){
        uint256 itemCount = _itemId.current();
        uint256 unsoldItemCount = _itemId.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        // Create an array of structure of size unsoldItemCount
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        for(uint256 i=0;i<itemCount;++i){
            if(idToMarketItem[i+1].owner == payable(address(0))){
                uint256 currentId = idToMarketItem[i+1].itemId;

                // storage keyword is important because that's 
                // how you actually access the marketItemin the store
                // but here we can use memory itself because we only 
                // have to store the currentItem to assign it to another mapping
                MarketItem memory currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Returns only items that a user has purchased
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
      uint totalItemCount = _itemId.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].owner == msg.sender) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].owner == msg.sender) {
          uint currentId = i + 1;
          MarketItem memory currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    /* Returns only items a user has listed */
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
      uint totalItemCount = _itemId.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
          itemCount += 1;
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
          uint currentId = i + 1;
          MarketItem memory currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }
}

