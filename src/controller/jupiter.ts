import {
    QuoteGetRequest,
    QuoteResponse,
    SwapResponse,
    createJupiterApiClient,
  } from "@jup-ag/api";
import { Connection, Keypair, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { BN, Wallet } from "@project-serum/anchor";
import bs58 from "bs58";
import { transactionSenderAndConfirmationWaiter } from '../utils/utils'
import { getSignature } from '../utils/utils'
import { eq } from "drizzle-orm";
import { importExistingWallet } from "./wallet";
import { botInstance } from "../utils/bot";
import { db } from "../utils/db";
import { tokens, trades } from "../model/schema";
import { getTokenInfo } from "./token";
import { WSOL_ADDRESS } from "../utils/constant";
import { getMint } from "@solana/spl-token";
import { getTokenOfUser } from "../model/token";
  
  // Create connection and Jupiter API client
  const connection = new Connection( process.env.MAINNET_RPC! );
  const jupiterQuoteApi = createJupiterApiClient();
  
  async function getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    autoSlippage: boolean,
    autoSlippageCollisionUsdValue: number,
    maxAutoSlippageBps: number,
    minimizeSlippage: boolean,
    onlyDirectRoutes: boolean,
    asLegacyTransaction: boolean
  ): Promise<QuoteResponse> {
    // Create params object
    const params: QuoteGetRequest = {
      inputMint,
      outputMint,
      amount,
      autoSlippage,
      autoSlippageCollisionUsdValue,
      maxAutoSlippageBps,
      minimizeSlippage,
      onlyDirectRoutes,
      asLegacyTransaction,
    };
  
    // Get quote
    const quote = await jupiterQuoteApi.quoteGet(params);
  
    if (!quote) {
      throw new Error("unable to quote");
    }
    return quote;
  }
  
  async function getSwapObj(
    wallet: Wallet,
    quote: QuoteResponse,
    dynamicComputeUnitLimit: boolean,
    prioritizationFeeLamports: string
  ): Promise<SwapResponse> {
    // Get serialized transaction
    const swapObj = await jupiterQuoteApi.swapPost({
      swapRequest: {
        quoteResponse: quote,
        userPublicKey: wallet.publicKey.toBase58(),
        dynamicComputeUnitLimit,
        prioritizationFeeLamports,
      },
    });
    return swapObj;
  }
  
 export async function flowQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    autoSlippage: boolean,
    autoSlippageCollisionUsdValue: number,
    maxAutoSlippageBps: number,
    minimizeSlippage: boolean,
    onlyDirectRoutes: boolean,
    asLegacyTransaction: boolean
  ) {
    const quote = await getQuote(
      inputMint,
      outputMint,
      amount,
      autoSlippage,
      autoSlippageCollisionUsdValue,
      maxAutoSlippageBps,
      minimizeSlippage,
      onlyDirectRoutes,
      asLegacyTransaction
    );
    console.dir(quote, { depth: null });
  }
  
  export async function flowQuoteAndSwap(
    privateKey: string,
    inputMint: string,
    outputMint: string,
    amount: number,
    autoSlippage: boolean,
    autoSlippageCollisionUsdValue: number,
    maxAutoSlippageBps: number,
    minimizeSlippage: boolean,
    onlyDirectRoutes: boolean,
    asLegacyTransaction: boolean,
    dynamicComputeUnitLimit: boolean,
    prioritizationFeeLamports: string,
    chatId: number,
    newBuy: boolean
  ) {
    try {
      
      const connection = new Connection(process.env.MAINNET_RPC!);
      const inputMintInfo = await getMint(connection, new PublicKey(inputMint));
      const outputMintInfo = await getMint(connection, new PublicKey(inputMint));
      
      botInstance.sendMessage(chatId, 'Processing ...')
      const wallet = new Wallet(importExistingWallet(privateKey));
      console.log("Wallet:", wallet.publicKey.toBase58());
    
      const quote = await getQuote(
        inputMint,
        outputMint,
        amount * 10 ** inputMintInfo.decimals,
        autoSlippage,
        autoSlippageCollisionUsdValue,
        maxAutoSlippageBps,
        minimizeSlippage,
        onlyDirectRoutes,
        asLegacyTransaction
      );
      console.log('===========136===============')
      console.dir(quote, { depth: null });
    
      const swapObj = await getSwapObj(
        wallet,
        quote,
        dynamicComputeUnitLimit,
        prioritizationFeeLamports
      );
      console.log('===========145===============')
      console.dir(swapObj, { depth: null });
    
      // Serialize the transaction
      const swapTransactionBuf = Buffer.from(swapObj.swapTransaction, "base64");
      var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    
      // Sign the transaction
      transaction.sign([wallet.payer]);
      const signature = getSignature(transaction);
    
      // We first simulate whether the transaction would be successful
      console.log('===========157===============')
      const { value: simulatedTransactionResponse } =
        await connection.simulateTransaction(transaction, {
          replaceRecentBlockhash: true,
          commitment: "processed",
        });
      const { err, logs } = simulatedTransactionResponse;
    
      if (err) {
        console.error("Simulation Error:");
        console.error({ err, logs });
        botInstance.sendMessage(chatId, 'Simulation Error, Check your trading amount')
        return;
      }
    
      const serializedTransaction = Buffer.from(transaction.serialize());
      const blockhash = transaction.message.recentBlockhash;
      let outputAmount = 0;
      console.log('===========176===============')
      try {
        const transactionResponse = await transactionSenderAndConfirmationWaiter({
          connection,
          serializedTransaction,
          blockhashWithExpiryBlockHeight: {
            blockhash,
            lastValidBlockHeight: swapObj.lastValidBlockHeight,
          },
        });

        if (!transactionResponse) {
          console.error("Transaction not confirmed");
          botInstance.sendMessage(chatId, 'Transaction not confirmed')

          return;
        }
      
      console.log('===========194===============')
        if (transactionResponse.meta?.err) {
          console.log('tx error')
          console.error(transactionResponse.meta?.err);
        }
        for (const token of transactionResponse.meta?.postTokenBalances!){
          if(token.mint == outputMint){
            for(const preToken of transactionResponse.meta?.preTokenBalances!){
              if(preToken.mint == outputMint){
                outputAmount = +token.uiTokenAmount - +preToken.uiTokenAmount
              }
            }
          }
        }
      } catch (error) {
        console.log('swap error')
        console.log(error)
      }
      await db.insert(trades).values({
        chatId,
        tokenAddress: outputMint,
        isBuy: true,
        amountIn: new BN(amount * 10 ** inputMintInfo.decimals),
        amountOut: new BN(outputAmount * 10 ** outputMintInfo.decimals),
      })
      
      console.log('newBuy variable', newBuy)
      if(newBuy){
        // const tokenMeta = await getTokenOfUser(chatId, outputMint);
        const tokenMeta = await getTokenInfo(outputMint)
        console.log(outputMint, tokenMeta, 'swapJupiter:226')
        await db.insert(tokens).values({
          chatId,
          address: outputMint,
          totalSpentSol: new BN(amount * 10 ** outputMintInfo.decimals),
          name: tokenMeta.content.metadata.name,
          symbol: tokenMeta.content.metadata.symbol,
        })
      }
      else 
        {
          const spentSol = (inputMint == WSOL_ADDRESS ? amount : outputAmount);
          const inputAddress = (inputMint != WSOL_ADDRESS ? inputMint : outputMint);
          console.log(inputMint)
          const res = await db.select().from(tokens).where(eq(tokens.chatId, chatId) && eq(tokens.address, inputAddress));
          console.log(res, 'res');
          await db
            .update(tokens)
            .set({
              totalSpentSol: 
                inputMint == WSOL_ADDRESS ? 
                res[0].totalSpentSol.add(new BN(spentSol * 10 ** 9)) : 
                res[0].totalSpentSol.sub(new BN(spentSol * 10 ** 9))})
            .where(eq(tokens.chatId, chatId) && eq(tokens.address, inputAddress));
        }
      botInstance.sendMessage(chatId, `Tx confirmed\nhttps://solscan.io/tx/${signature}`);
        
    } catch (error) {
      console.log(error)
      console.error('Error on Swap\n')
      botInstance.sendMessage(chatId, 'Swap is failed. Please Retry')
    }
  }
  
  // export async function main() {
  //   const flowType = process.env.FLOW;
  //   const privateKey = process.env.PRIVATE_KEY || "";
  //   const inputMint = "So11111111111111111111111111111111111111112"; // SOL
  //   const outputMint = "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm"; // $WIF
  //   const amount = 100000000; // 0.1 SOL
  //   const autoSlippage = true;
  //   const autoSlippageCollisionUsdValue = 1000;
  //   const maxAutoSlippageBps = 1000; // 10%
  //   const minimizeSlippage = true;
  //   const onlyDirectRoutes = false;
  //   const asLegacyTransaction = false;
  //   const dynamicComputeUnitLimit = true;
  //   const prioritizationFeeLamports = "auto";
  
  //   switch (flowType) {
  //     case "quote": {
  //       await flowQuote(
  //         inputMint,
  //         outputMint,
  //         amount,
  //         autoSlippage,
  //         autoSlippageCollisionUsdValue,
  //         maxAutoSlippageBps,
  //         minimizeSlippage,
  //         onlyDirectRoutes,
  //         asLegacyTransaction
  //       );
  //       break;
  //     }
  
  //     case "quoteAndSwap": {
  //       await flowQuoteAndSwap(
  //         privateKey,
  //         inputMint,
  //         outputMint,
  //         amount,
  //         autoSlippage,
  //         autoSlippageCollisionUsdValue,
  //         maxAutoSlippageBps,
  //         minimizeSlippage,
  //         onlyDirectRoutes,
  //         asLegacyTransaction,
  //         dynamicComputeUnitLimit,
  //         prioritizationFeeLamports
  //       );
  //       break;
  //     }
  
  //     default: {
  //       console.error("Please set the FLOW environment");
  //     }
  //   }
  // }
  
  // main();
  