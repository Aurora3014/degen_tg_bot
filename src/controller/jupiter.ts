import {
    QuoteGetRequest,
    QuoteResponse,
    SwapResponse,
    createJupiterApiClient,
  } from "@jup-ag/api";
  import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
  import { Wallet } from "@project-serum/anchor";
  import bs58 from "bs58";
  import { transactionSenderAndConfirmationWaiter } from '../utils/utils'
  import { getSignature } from '../utils/utils'
  
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
    prioritizationFeeLamports: string
  ) {
    const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(privateKey)));
    console.log("Wallet:", wallet.publicKey.toBase58());
  
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
  
    const swapObj = await getSwapObj(
      wallet,
      quote,
      dynamicComputeUnitLimit,
      prioritizationFeeLamports
    );
    console.dir(swapObj, { depth: null });
  
    // Serialize the transaction
    const swapTransactionBuf = Buffer.from(swapObj.swapTransaction, "base64");
    var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
  
    // Sign the transaction
    transaction.sign([wallet.payer]);
    const signature = getSignature(transaction);
  
    // We first simulate whether the transaction would be successful
    const { value: simulatedTransactionResponse } =
      await connection.simulateTransaction(transaction, {
        replaceRecentBlockhash: true,
        commitment: "processed",
      });
    const { err, logs } = simulatedTransactionResponse;
  
    if (err) {
      console.error("Simulation Error:");
      console.error({ err, logs });
      return;
    }
  
    const serializedTransaction = Buffer.from(transaction.serialize());
    const blockhash = transaction.message.recentBlockhash;
  
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
      return;
    }
  
    if (transactionResponse.meta?.err) {
      console.error(transactionResponse.meta?.err);
    }
  
    console.log(`https://solscan.io/tx/${signature}`);
  }
  
  export async function main() {
    const flowType = process.env.FLOW;
    const privateKey = process.env.PRIVATE_KEY || "";
    const inputMint = "So11111111111111111111111111111111111111112"; // SOL
    const outputMint = "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm"; // $WIF
    const amount = 100000000; // 0.1 SOL
    const autoSlippage = true;
    const autoSlippageCollisionUsdValue = 1000;
    const maxAutoSlippageBps = 1000; // 10%
    const minimizeSlippage = true;
    const onlyDirectRoutes = false;
    const asLegacyTransaction = false;
    const dynamicComputeUnitLimit = true;
    const prioritizationFeeLamports = "auto";
  
    switch (flowType) {
      case "quote": {
        await flowQuote(
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
        break;
      }
  
      case "quoteAndSwap": {
        await flowQuoteAndSwap(
          privateKey,
          inputMint,
          outputMint,
          amount,
          autoSlippage,
          autoSlippageCollisionUsdValue,
          maxAutoSlippageBps,
          minimizeSlippage,
          onlyDirectRoutes,
          asLegacyTransaction,
          dynamicComputeUnitLimit,
          prioritizationFeeLamports
        );
        break;
      }
  
      default: {
        console.error("Please set the FLOW environment");
      }
    }
  }
  
  main();
  