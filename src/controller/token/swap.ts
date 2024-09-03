import { getPoolInfo, getTokenInfo } from "."
import { getUser } from "../../model/user"
import { importExistingWallet } from "../wallet"
import { NATIVE_MINT } from "@solana/spl-token"
import { initRayidumInstance, txVersion } from "../../utils/amm"
import { ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2"
import { BN } from 'bn.js'
import Decimal from "decimal.js"
import { botInstance } from "../../utils/bot"
import { eq } from "drizzle-orm"
import { db } from "../../utils/db"
import { tokens, trades } from "../../model/schema"
import { isValidAmm } from "../../utils/utils"
import { flowQuoteAndSwap } from "../jupiter"
import { WSOL_ADDRESS } from "../../utils/constant"

// const swapToken = async (chatId: number, tokenAddress: string, amountIn: number, isBuy: boolean = true) => {
//     console.log(`Buy ${tokenAddress}`)
//     botInstance.sendMessage(chatId, 'Processing transaction ...')
//     const user = await getUser(chatId)
//     const owner = importExistingWallet( user!.secretKey! )
//     const raydium = await initRayidumInstance(owner)
//     const poolInfo = await getPoolInfo(owner, tokenAddress, isBuy)
//     const poolDetail = (await raydium.api.fetchPoolById({ids: poolInfo.id}))[0] as ApiV3PoolInfoStandardItem
//     const inputMint = NATIVE_MINT.toBase58()
//     if (!isValidAmm(poolInfo.programId)) throw new Error('target pool is not AMM pool')
//     const poolKeys = await raydium.liquidity.getAmmPoolKeys(poolInfo.id)
//     const rpcData = await raydium.liquidity.getRpcPoolInfo(poolInfo.id)
//     const [baseReserve, quoteReserve, status] = [rpcData.baseReserve, rpcData.quoteReserve, rpcData.status.toNumber()]

//     if (poolInfo.mintA.address !== inputMint && poolInfo.mintB.address !== inputMint)
//         throw new Error('input mint does not match pool')

//     const baseIn = inputMint === poolInfo.mintA.address
//     const [mintIn, mintOut] = baseIn ? [poolInfo.mintA, poolInfo.mintB] : [poolInfo.mintB, poolInfo.mintA]

//     const out = raydium.liquidity.computeAmountOut({
//         poolInfo: {
//         ...poolDetail,
//         baseReserve,
//         quoteReserve,
//         status,
//         version: 4,
//         },
//         amountIn: new BN(amountIn),
//         mintIn: mintIn.address,
//         mintOut: mintOut.address,
//         slippage: isBuy ? user?.buySlippage! : user?.sellSlippage!, // range: 1 ~ 0.0001, means 100% ~ 0.01%
//     })

//     console.log(
//         `computed swap ${new Decimal(amountIn)
//         .div(10 ** mintIn.decimals)
//         .toDecimalPlaces(mintIn.decimals)
//         .toString()} ${mintIn.symbol || mintIn.address} to ${new Decimal(out.amountOut.toString())
//         .div(10 ** mintOut.decimals)
//         .toDecimalPlaces(mintOut.decimals)
//         .toString()} ${mintOut.symbol || mintOut.address}, minimum amount out ${new Decimal(out.minAmountOut.toString())
//         .div(10 ** mintOut.decimals)
//         .toDecimalPlaces(mintOut.decimals)} ${mintOut.symbol || mintOut.address}`
//     )
//     const jitoRaydium = await initRayidumInstance(owner, false);
//     const {execute} = await jitoRaydium.liquidity.swap({
//         poolInfo: poolDetail,
//         poolKeys,
//         amountIn: new BN(amountIn),
//         amountOut: out.minAmountOut, // out.amountOut means amount 'without' slippage
//         fixedSide: 'in',
//         inputMint: mintIn.address,
//         txVersion,
//         config: {}
//         // optional: set up token account
//         // config: {
//         //   inputUseSolBalance: true, // default: true, if you want to use existed wsol token account to pay token in, pass false
//         //   outputUseSolBalance: true, // default: true, if you want to use existed wsol token account to receive token out, pass false
//         //   associatedOnly: true, // default: true, if you want to use ata only, pass true
//         // },

//         // optional: set up priority fee here
//         // computeBudgetConfig: {
//         //   units: 600000,
//         //   microLamports: 100000000,
//         // },
//     })
//     const token = await db.select().from(tokens).where(eq(tokens.address, tokenAddress) && eq(tokens.chatId, chatId))
    
//     // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
//     execute({ sendAndConfirm: true }).then(async (res) => {
//         if(!token.length)
//             await db.insert(tokens).values({
//                 chatId,
//                 address: tokenAddress,
//                 name: mintOut.name,
//                 symbol: mintOut.symbol,
//                 totalSpentSol: new BN(amountIn)
//             })
//         else 
//             await db.update(tokens).set({
//                 totalSpentSol: isBuy ? token[0].totalSpentSol.add(new BN(amountIn)) : token[0].totalSpentSol.sub(new BN(out.amountOut))
//             }).where(eq(tokens.address, tokenAddress) && eq(tokens.chatId, chatId));
//         ///////
//         await db.insert(trades).values({
//             chatId,
//             tokenAddress,
//             isBuy: true,
//             amountIn: new BN(amountIn),
//             amountOut: out.amountOut
//         })
//         await botInstance.sendMessage(
//             chatId,
//             `Swap Successful:\n` + 
//             `Computed swap, <b>${new Decimal(amountIn)
//                 .div(10 ** mintIn.decimals)
//                 .toDecimalPlaces(mintIn.decimals)
//                 .toString()}${mintIn.symbol || mintIn.address}</b> to <b> ${new Decimal(out.amountOut.toString())
//                 .div(10 ** mintOut.decimals)
//                 .toDecimalPlaces(mintOut.decimals)
//                 .toString()} </b> $${mintOut.symbol || mintOut.address}</b>, TVL: $${poolInfo.tvl}\n` + 
//             `https://solscan.io/tx/${res.txId}`,
//             {
//                 reply_markup: {
//                     inline_keyboard:[
//                         [
//                             {text: 'Continue', callback_data: 'manage'}
//                         ]
//                     ]
//                 },
//                 parse_mode: 'HTML'
//             }
//         )
//     }).catch(async error => {
//         await botInstance.sendMessage(
//             chatId,
//             error.toString(),
//             {
//                 reply_markup: {
//                     inline_keyboard:[
//                         [
//                             {text: 'Continue', callback_data: 'start'}
//                         ]
//                     ]
//                 },
//             }
//         )
//     })
// }


export const swapJupiter = async (chatId: number, tokenAddress: string, amountIn: number, isBuy: boolean = true, newBuy: boolean = false) => {
    const user = await getUser(chatId);
    // getTokenInfo
    await flowQuoteAndSwap(
        user?.secretKey!,
        isBuy ? WSOL_ADDRESS : tokenAddress, 
        isBuy ? tokenAddress : WSOL_ADDRESS,
        amountIn,
        false,
        0,
        100 * ( isBuy ? user?.buySlippage! : user?.sellSlippage! ),
        true,
        false,
        false,
        true,
        "auto",
        chatId,
        newBuy
    )
}