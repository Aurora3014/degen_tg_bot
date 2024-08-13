import { eq } from "drizzle-orm"
import { db } from "../utils/db"
import { tokens, users } from "./schema"

export const getTokenOfUser = async (chatId: number) => {
    const result = await db.select().from(users).innerJoin(tokens, eq(users.chatId, tokens.chatId));
    return result;
}