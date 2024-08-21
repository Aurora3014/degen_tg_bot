import { eq } from "drizzle-orm"
import { db } from "../utils/db"
import { tokens, users } from "./schema"

export const getTokensOfUser = async (chatId: number) => {
    const result = await db.select().from(users).innerJoin(tokens, eq(users.chatId, tokens.chatId)).where(eq(users.chatId, chatId));
    return result;
}
export const getTokenOfUser = async (chatId: number, tokenAddress: string) => {
    const result = await db.select().from(users).innerJoin(tokens, eq(users.chatId, tokens.chatId)).where(eq(users.chatId, chatId) && eq(tokens.address, tokenAddress));
    return result;
}