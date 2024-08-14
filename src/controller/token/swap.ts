import { Keypair } from "@solana/web3.js"
import { getPoolInfo } from "."
import { getUser } from "../../model/user"
import { importExistingWallet } from "../wallet"
import { NATIVE_MINT } from "@solana/spl-token"
import { initRayidumInstance, txVersion } from "../../utils/amm"
import { ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2"
import { BN } from 'bn.js'
import Decimal from "decimal.js"

const buytoken = async (chatId: number, tokenAddress: string, amountIn: number) => {
    const user = await getUser(chatId)
    const owner = importExistingWallet( user!.secretKey! )
    const raydium = await initRayidumInstance(owner)
    const poolInfo = await getPoolInfo(owner, tokenAddress)
    const poolDetail = (await raydium.api.fetchPoolById({ids: poolInfo.id}))[0] as ApiV3PoolInfoStandardItem
    const inputMint = NATIVE_MINT.toBase58()
    const poolKeys = await raydium.liquidity.getAmmPoolKeys(poolInfo.id)
    const rpcData = await raydium.liquidity.getRpcPoolInfo(poolInfo.id)
    const [baseReserve, quoteReserve, status] = [rpcData.baseReserve, rpcData.quoteReserve, rpcData.status.toNumber()]

    if (poolInfo.mintA.address !== inputMint && poolInfo.mintB.address !== inputMint)
        throw new Error('input mint does not match pool')

    const baseIn = inputMint === poolInfo.mintA.address
    const [mintIn, mintOut] = baseIn ? [poolInfo.mintA, poolInfo.mintB] : [poolInfo.mintB, poolInfo.mintA]

    const out = raydium.liquidity.computeAmountOut({
        poolInfo: {
        ...poolDetail,
        baseReserve,
        quoteReserve,
        status,
        version: 4,
        },
        amountIn: new BN(amountIn),
        mintIn: mintIn.address,
        mintOut: mintOut.address,
        slippage: 0.01, // range: 1 ~ 0.0001, means 100% ~ 0.01%
    })

    console.log(
        `computed swap ${new Decimal(amountIn)
        .div(10 ** mintIn.decimals)
        .toDecimalPlaces(mintIn.decimals)
        .toString()} ${mintIn.symbol || mintIn.address} to ${new Decimal(out.amountOut.toString())
        .div(10 ** mintOut.decimals)
        .toDecimalPlaces(mintOut.decimals)
        .toString()} ${mintOut.symbol || mintOut.address}, minimum amount out ${new Decimal(out.minAmountOut.toString())
        .div(10 ** mintOut.decimals)
        .toDecimalPlaces(mintOut.decimals)} ${mintOut.symbol || mintOut.address}`
    )

    const { execute } = await raydium.liquidity.swap({
        poolInfo: poolDetail,
        poolKeys,
        amountIn: new BN(amountIn),
        amountOut: out.minAmountOut, // out.amountOut means amount 'without' slippage
        fixedSide: 'in',
        inputMint: mintIn.address,
        txVersion,

        // optional: set up token account
        // config: {
        //   inputUseSolBalance: true, // default: true, if you want to use existed wsol token account to pay token in, pass false
        //   outputUseSolBalance: true, // default: true, if you want to use existed wsol token account to receive token out, pass false
        //   associatedOnly: true, // default: true, if you want to use ata only, pass true
        // },

        // optional: set up priority fee here
        // computeBudgetConfig: {
        //   units: 600000,
        //   microLamports: 100000000,
        // },
    })

    // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
    const { txId } = await execute({ sendAndConfirm: true })
    console.log(`swap successfully in amm pool:`, { txId })
}