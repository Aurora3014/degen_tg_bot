import { eq } from "drizzle-orm"
import { db } from "../utils/db"
import { users } from "./schema"
import { Keypair } from "@solana/web3.js";

// State

export const getUserState = async (chatId: number) => {
    const user = await db.select().from(users).where(eq(users.chatId, chatId));
    return user.length ?  user[0].state : undefined;
}

export const updateUserState = async (chatId: number, newState: string) => {
    const user = await db.update(users).set({state: newState}).where(eq(users.chatId, chatId));
    return user.length ? true : false;
}

export const updateUserParams = async (chatId: number, newParams: string) => {
    const user = await db.update(users).set({params: newParams}).where(eq(users.chatId, chatId));
    return user.length ? true : false;
}

export const createUser = async (chatId: number) => {
    const user = await db.insert(users).values({chatId});
    return user.length ? true : false
} 

export const getUser = async (chatId: number) => {
    const user = await db.select().from(users).where(eq(users.chatId, chatId));
    return user.length ?  user[0] : undefined;
}

export const getUsers = async () => {
    const user = await db.select().from(users);
    return user.length ? user : undefined;
}

export const updateUserWallet = async (chatId: number, keyPair: Keypair) => {
    const user = await db.update(users).set({
        publicKey: keyPair.publicKey.toString(), 
        secretKey: keyPair.secretKey.toString()
    }).where(eq(users.chatId, chatId));

    return user ? true : false;
}

export const updateUser = async (chatId: number, newUser: any ) => {
    const user = await db.update(users).set({
        ...newUser
    }).where(eq(users.chatId, chatId));

    return user ? true : false
}

