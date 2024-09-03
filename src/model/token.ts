import { eq } from "drizzle-orm"
import { db } from "../utils/db"
import { tokens, users } from "./schema"
import { fetchPrice } from "../controller/api/fetchPrice";
import { WSOL_ADDRESS } from "../utils/constant";

export const getTokensOfUser = async (chatId: number) => {
    const result = await db.select().from(users).innerJoin(tokens, eq(users.chatId, tokens.chatId)).where(eq(users.chatId, chatId));
    return result;
}
export const getTokenOfUser = async (chatId: number, tokenAddress: string) => {
    const result = await db.select().from(users).innerJoin(tokens, eq(users.chatId, tokens.chatId)).where(eq(users.chatId, chatId) && eq(tokens.address, tokenAddress));
    return result;
}

export const getTokenPrices = async () => {
    const result = await db.select().from(tokens).groupBy(tokens.address, tokens.id);
    let address: string[] = []
    for(const token of result){
        address.push(token.address);
    }
    if(address)
        return await fetchPrice(address.join(','), WSOL_ADDRESS);
}