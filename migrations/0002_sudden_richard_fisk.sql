ALTER TABLE "tokens" ALTER COLUMN "total_spent_sol" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "total_spent_sol" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "buy_slippage" double precision DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sell_slippage" double precision DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "priority_fee" double precision DEFAULT 0.001 NOT NULL;