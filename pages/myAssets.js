import Head from 'next/head'
import { useEffect, useState } from 'react'
import { nftAddress, nftMarketAddress } from '../config'
import styles from '../styles/Home.module.css'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import { ethers } from 'ethers'
import axios from 'axios'

import Web3Modal from "web3modal"

export default function Home() {

  const [nfts,setNfts] = useState([])
  const [loadingState,setLoadingState] = useState('not-loaded')

  useEffect(()=>{
    loadNfts()
  },[])

  async function loadNfts(){
    const web3modal = new Web3Modal()
    const connection = await web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(nftMarketAddress,NFTMarket.abi,signer)
    const tokenContract = new ethers.Contract(nftAddress,NFT.abi,signer)

    const data = await marketContract.fetchMyNFTs()
    console.log(`data is ${data}`)

    const items = await Promise.all(data.map(async i=>{
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      // information stored in ipfs
      const meta = await axios.get(tokenUri)  // tokenURI would be like https:ipfs...
      let price = ethers.utils.formatUnits(i.price.toString(),'ether')
      let item = {
        price,
        tokenId : i.tokenId,
        seller: i.seller,
        owner: i.owner,
        image: meta.data.fileUrl,
        name: meta.data.name,
        description : meta.data.description,
      }
      console.log(`item is ${item.price},${item.tokenId},${item.seller}
      ${item.owner},${item.image},${item.name},${item.description}`)
      return item
    }))
      setNfts(items)
      console.log(`item is ${items}`)
      setLoadingState('loaded')
  }

  return (
    <div>
      <div className={styles.container}>
        <Head>
          <title>NFT MarketPlace</title>
          <meta name="description" content="This is a NFT MarketPlace" />
          <link rel="icon" href="/ape.png" />
        </Head>
      </div>
      <div className='flex justify-center'>
        <div className='px-400' style={{maxwidth : '1600px'}}>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
              {
                nfts.map((nft,i)=>(
                  <div key={i} className='border shadow rounded-xl overflow-hidden'>
                    <img src={nft.image}/>
                    <div className='p-4'>
                      <p style={{height: '64px'}} className='text-2xl font-semibold'>{nft.name}</p>
                    </div>
                    <div style={{height:'70px',overflow: 'hidden'}}>
                      <p className='text-gray-400'>{nft.description}</p>
                    </div>
                  </div>
                ))
              }
          </div>
        </div>
      </div>
    </div>
  )
}