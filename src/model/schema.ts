import { bigserial, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
   chatId: bigserial("chatId", { mode: "number" }).primaryKey().notNull(),
   publicKey: varchar("publicKey", { length: 50 }).default(''),
   secretKey: varchar("secretKey", { length: 256 }).default(''),
   state: text("state").default(''),
})