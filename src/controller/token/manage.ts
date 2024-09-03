import { eq } from "drizzle-orm";
import { getTokenBalance } from ".";
import { tokens } from "../../model/schema";
import { getTokenOfUser } from "../../model/token";
import { getUser } from "../../model/user";
import { db } from "../../utils/db";
import { swapJupiter } from "./swap";
// import { swapToken } from "./swap";

export const getTPPrice = async (currentPriceInSol: number) => {
    return currentPriceInSol * 120 / 100;
}

export const getSLPrice = async (currentPriceInSol: number) => {
    return currentPriceInSol * 80 / 100;
}

export const getTSPrice = async (currentPriceInSol: number) => {
    return currentPriceInSol * 80 / 100;
}

export const closePosition = async ( chatId: number, tokenAddress: string ) => {
    const user = await getUser(chatId)
    const token = (await getTokenOfUser(chatId, tokenAddress))[0];
    const tokenBalance = await getTokenBalance(user!.publicKey!, token.tokens.address);
    await swapJupiter(user!.chatId, token.tokens.address, tokenBalance, false);
    await db.delete(tokens).where(eq(tokens.chatId, chatId) && eq(tokens.address, tokenAddress) )
}