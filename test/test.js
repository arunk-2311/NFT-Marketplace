const { expect} = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function (){
  it("Should create and execute sales for NFT MarketPlace",async function(){
    const [_,buyerAddress] = await ethers.getSigners()

    const Market = await ethers.getContractFactory("NFTMarket")
    const market = await Market.deploy()
    await market.deployed()

    const nftContract = await ethers.getContractFactory("NFT")
    const nft = await nftContract.deploy(market.address)

    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()

    let auctionPrice = ethers.utils.parseUnits("10","ether")

    await nft.createToken("https://www.mytokenlocation.com")
    await nft.createToken("https://www.mytokenlocation2.com")

    await market.createMarketItem(nft.address,1,auctionPrice,{value:listingPrice});

    await market.createMarketItem(nft.address,2,auctionPrice,{value:listingPrice});    

    await market.connect(buyerAddress).createMarketSale(
      nft.address,
      1,
      {value:auctionPrice}
    );

    items = await market.fetchMarketItems()

    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))

    console.log(`items in the market after buying are`,items)

  });
  
});
