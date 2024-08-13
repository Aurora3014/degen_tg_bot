CREATE TABLE IF NOT EXISTS "positions" (
	"publicKey" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(20) NOT NULL,
	"symbol" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trades" (
	"chatId" bigserial PRIMARY KEY NOT NULL,
	"token_address" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"is_buy" boolean NOT NULL,
	"amount" bigint NOT NULL,
	"price" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "publicKey" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "secretKey" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "state" SET DEFAULT '';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades" ADD CONSTRAINT "trades_token_address_positions_publicKey_fk" FOREIGN KEY ("token_address") REFERENCES "public"."positions"("publicKey") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
