import { publicKey } from "@raydium-io/raydium-sdk-v2";
import BN from "bn.js";
import { bigint, bigserial, boolean, customType, doublePrecision, integer, numeric, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

const bn = customType<{
   data: BN;
   driverData: bigint;
   notNull: true;
 }>({
   dataType() {
     return "bigint";
   },
   toDriver(value: BN): bigint {
     return BigInt(value.toString());
   },
   fromDriver(value: bigint): BN {
     return new BN(value.toString());
   },
 });

export const users = pgTable('users', {
   chatId: bigserial('chat_id', {mode: 'number'}).primaryKey().notNull(),
   publicKey: varchar("public_key", { length: 50 }).default(''),
   secretKey: varchar("secret_key", { length: 256 }).default(''),
   state: text("state").default(''),
   params: text("params").default(''),
   buyOption1: doublePrecision("buy_option1").notNull().default(1),
   buyOption2: doublePrecision("buy_option2").notNull().default(2),
   sellOption1: doublePrecision("sell_option1").notNull().default(1),
   sellOption2: doublePrecision("sell_option2").notNull().default(2),
   buySlippage: doublePrecision("buy_slippage").notNull().default(1),       // %
   sellSlippage: doublePrecision("sell_slippage").notNull().default(1),     // %
   priorityFee: doublePrecision("priority_fee").notNull().default(0.001),   //SOL
})

export const tokens = pgTable ('tokens', {
   address: varchar("public_key", { length: 50 }).primaryKey().notNull(),
   chatId: bigint('chat_id', {mode: 'number'}).references(() => users.chatId, {
      onDelete: 'cascade'
   }).notNull(),
   name: varchar("name", { length: 20 }).notNull(),
   symbol: varchar("symbol", { length: 10 }).notNull(),
   totalSpentSol: bn("total_spent_sol").notNull(),
   // description: varchar("description", { length: 256 }),
})

export const trades = pgTable('trades', {
   id: bigserial("id", {mode: 'number'}).primaryKey().notNull(),
   chatId: bigint ('chat_id', {mode: 'number'}).references(() => users.chatId, {
      onDelete: 'cascade'
   }).notNull(),
   tokenAddress: varchar("token_address", { length: 50 })
      .notNull(),
   timestamp: timestamp("timestamp", { withTimezone: true })
      .defaultNow()
      .notNull(),
   isBuy: boolean('is_buy').notNull(),
   amountIn: bn('amount_in').notNull(),
   amountOut: bn('amount_out').notNull()
})