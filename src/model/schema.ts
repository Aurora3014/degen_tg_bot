import { publicKey } from "@raydium-io/raydium-sdk-v2";
import { bigint, bigserial, boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
   chatId: bigserial("chatId", { mode: "number" }).primaryKey().notNull(),
   publicKey: varchar("publicKey", { length: 50 }).default(''),
   secretKey: varchar("secretKey", { length: 256 }).default(''),
   state: text("state").default(''),
   buyOption1: integer("buy_option1").notNull().default(1),
   buyOption2: integer("buy_option2").notNull().default(2),
})

export const tokens = pgTable ('tokens', {
   address: varchar("publicKey", { length: 50 }).primaryKey().notNull(),
   chatId: bigserial("chatId", { mode: "number" }).notNull(),
   name: varchar("name", { length: 20 }).notNull(),
   symbol: varchar("symbol", { length: 10 }).notNull(),
   // description: varchar("description", { length: 256 }),
})

export const trades = pgTable('trades', {
   id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
   chatId: bigserial('chatId', {mode: 'number'}).notNull(),
   tokenAddress: text("token_address")
      .references(() => tokens.address, {
         onDelete: "cascade",
      })
      .notNull(),
   timestamp: timestamp("timestamp", { withTimezone: true })
      .defaultNow()
      .notNull(),
   isBuy: boolean('is_buy').notNull(),
   amount: bigint('amount',{mode: 'bigint'}).notNull(),
   price: bigint('price', {mode: 'bigint'}).notNull()
})