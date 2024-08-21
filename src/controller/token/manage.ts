import { getTokenBalance } from ".";
import { getTokenOfUser } from "../../model/token";
import { getUser } from "../../model/user";
import { swapToken } from "./swap";

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
    await swapToken(user!.chatId, token.tokens.address, tokenBalance, false);
}