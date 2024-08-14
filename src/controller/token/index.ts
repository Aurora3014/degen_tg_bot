import { publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { DasApiAssetWithTokenInfo, WSOL_ADDRESS } from '../../utils/constant';
import { Commitment, Connection, Keypair, PublicKey } from '@solana/web3.js';

import { initRayidumInstance } from '../../utils/amm';
import { PoolFetchType } from '@raydium-io/raydium-sdk-v2';


export const getTokenInfo = async (address: string) => {
    const umi = createUmi(process.env.MAINNET_RPC!).use(dasApi());
    const assetId = publicKey(address);

    const asset = ( await umi.rpc.getAsset(assetId)) as DasApiAssetWithTokenInfo;
    return asset;
}

export async function getPoolInfo(owner: Keypair, mintAddress: string){
    const raydium = await initRayidumInstance(owner);

    const list = await raydium.api.fetchPoolByMints({
        mint1: WSOL_ADDRESS, // required input
        mint2: mintAddress, // optional output
        type: PoolFetchType.All, // optional
        sort: 'liquidity', // optional
        order: 'desc', // optional
        page: 1, // optional
    })
    return list.data[0]
}

