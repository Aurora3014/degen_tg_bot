import { Raydium, TxVersion } from "@raydium-io/raydium-sdk-v2";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";

export const connection = new Connection('https://doralyn-onotsf-fast-mainnet.helius-rpc.com')
// export const connection = new Connection(clusterApiUrl('devnet'));

export const txVersion = TxVersion.V0 // or TxVersion.LEGACY

const cluster = 'mainnet';
let raydium: Raydium | undefined;

export const initRayidumInstance = async (owner: Keypair, loadToken?: boolean) => {
    if(raydium) return raydium;
    raydium = await Raydium.load({
        owner,
        connection,
        cluster,
        disableFeatureCheck: true,
        disableLoadToken: loadToken,
        blockhashCommitment: 'finalized'
        // urlConfigs: {
        //   BASE_HOST: '<API_HOST>', // api url configs, currently api doesn't support devnet
        // },
    })
    /**
     * By default: sdk will automatically fetch token account data when need it or any sol balace changed.
     * if you want to handle token account by yourself, set token account data after init sdk
     * code below shows how to do it.
     * note: after call raydium.account.updateTokenAccount, raydium will not automatically fetch token account
     */

    /*  
    raydium.account.updateTokenAccount(await fetchTokenAccountData())
    connection.onAccountChange(owner.publicKey, async () => {
        raydium!.account.updateTokenAccount(await fetchTokenAccountData())
    })
    */

    return raydium
}
