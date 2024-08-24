import { publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { DasApiAssetWithTokenInfo, WSOL_ADDRESS } from '../../utils/constant';
import { Commitment, Connection, Keypair, PublicKey } from '@solana/web3.js';

import { connection, initRayidumInstance } from '../../utils/amm';
import { PoolFetchType } from '@raydium-io/raydium-sdk-v2';

export const getTokenInfo = async (address: string) => {
    const umi = createUmi(process.env.MAINNET_RPC!).use(dasApi());
    const assetId = publicKey(address);
    const asset = ( await umi.rpc.getAsset(assetId)) as DasApiAssetWithTokenInfo;
    return asset;
}

export const getSOlBalance = async (address: string) => {
    
    const publicKey = new PublicKey(address);
    
    const lamports = await connection.getBalance(publicKey);
    
    const sol = lamports / 1_000_000_000;
    
    return sol
}

export async function getTokenBalance(walletAddress: string, tokenMintAddress: string) {
    // walletAddress = '9d1L1mSs8HrcUvyjYUMZqX4Gkj3bXdZS2cmNaNmeYe3u'
    const publicKey = new PublicKey(walletAddress);
    const tokenMint = new PublicKey(tokenMintAddress);
    
    // Get all token accounts by the owner (wallet address)
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: tokenMint,
    });
    
    // Find the token account with the balance
    const tokenBalance = tokenAccounts.value[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
    // console.log(tokenAccounts.value[0]?.account?.data?.parsed?.info?.tokenAmount);
    return tokenBalance
}

export async function getPoolInfo(owner: Keypair, mintAddress: string, isBuy: boolean = true){
    const raydium = await initRayidumInstance(owner);
        let list = isBuy ? await raydium.api.fetchPoolByMints({ 
            mint1: WSOL_ADDRESS, // required input
            mint2: mintAddress, // optional output
            type: PoolFetchType.Standard, // optional
            sort: 'liquidity', // optional
            order: 'desc', // optional
            page: 1, // optional
        }) : 
        await raydium.api.fetchPoolByMints({
            mint1: mintAddress, // required input
            mint2: WSOL_ADDRESS, // optional output
            type: PoolFetchType.Standard, // optional
            sort: 'liquidity', // optional
            order: 'desc', // optional
            page: 1, // optional
        })
    console.log(list.data[0]);
    return list.data[0]
}

