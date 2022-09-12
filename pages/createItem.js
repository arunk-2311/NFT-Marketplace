import { useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import {create as ipfsHttpClient} from "ipfs-http-client";
import { useRouter } from "next/router";
import styles from '../styles/Home.module.css'
import Head from 'next/head'


const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0")

import { nftAddress,nftMarketAddress } from "../config";

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

export default function createItem(){
    const [fileUrl,setFileUrl] = useState(null);
    const [formInput,updateFormInput] = useState({price:'',name:'',description:''})

    const router = useRouter()

    async function onChange(e){
        const file = e.target.files[0]
        try{
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                } 
            );
            const url = `https://ipfs.infura.io/ipfs/${added.path}`

            console.log(`image url is ${url}`)

            setFileUrl(url)
        }catch(error){
            console.log(error)
        }
    }

    async function createAsset(){
        const {price,name,description} = formInput
        if(!price || !name || !description) return

        const data = JSON.stringify({
            price,name,description,fileUrl
        });

        try{
            const added =await client.add(
                data,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                } 
            );
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            console.log(url)
            // console.log(added.path,added)
            createSale(url)
        }catch(error){
            console.log(error)
        }
    }

    async function createSale(url){
        const web3modal = new Web3Modal()
        const connection = await web3modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)

        const signer = provider.getSigner()
        const nft = new ethers.Contract(nftAddress,NFT.abi,signer)

        const mintToken = await nft.createToken(url)
        let tx = await mintToken.wait()

        let events = tx.events[0]
        let value = events.args[2]
        let tokenId = value.toNumber()

        console.log(formInput)

        console.log(`tokenId is ${tokenId}`)

        const price = ethers.utils.parseUnits(formInput.price,'ether')
        console.log(`price is ${price}`)

        const market = new ethers.Contract(nftMarketAddress,NFTMarket.abi,signer)

        console.log(market)

        let listingPrice = await market.getListingPrice()        
        listingPrice = listingPrice.toString()

        console.log(listingPrice)

        let transaction = await market.createMarketItem(
            nftAddress,
            tokenId,
            price,
            {value:listingPrice}
        );

        console.log(`We made the create item tx`)

        await transaction.wait()
        router.push('/')
    }

    return(
        <div>      
            <div className={styles.container}>
                <Head>
                <title>NFT MarketPlace</title>
                <meta name="description" content="This is a NFT MarketPlace" />
                <link rel="icon" href="/ape.png" />
                </Head>
            </div>
            <div className="flex justify-center">
                <div className="w-1/2 flex flex-col pb-12">
                    <input
                        placeholder="Asset Name"
                        className="mt-8 border rounded p-4"
                        onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                    />
                    <input
                        placeholder="Asset Description"
                        className="mt-8 border rounded p-4"
                        onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                    />
                    <input
                        placeholder="Asset Price in Matic"
                        className="mt-8 border rounded p-4"
                        onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                    />
                    <input
                        type="file"
                        name="Asset"
                        className="my-4"
                        onChange={onChange}
                    />            
                    {
                        fileUrl && (
                            <img className="rounded mt-4" width="350" src={fileUrl}/>
                        )
                    }
                    <button 
                        className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
                        onClick={()=>{createAsset()}}
                    >
                        Create Asset!
                    </button>
                </div>
            </div>
        </div>
    )
}