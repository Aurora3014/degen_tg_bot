CREATE TABLE IF NOT EXISTS "tokens" (
	"publicKey" varchar(50) PRIMARY KEY NOT NULL,
	"chatId" bigserial NOT NULL,
	"name" varchar(20) NOT NULL,
	"symbol" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trades" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"chatId" bigserial NOT NULL,
	"token_address" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"is_buy" boolean NOT NULL,
	"amount" bigint NOT NULL,
	"price" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"chatId" bigserial PRIMARY KEY NOT NULL,
	"publicKey" varchar(50) DEFAULT '',
	"secretKey" varchar(256) DEFAULT '',
	"state" text DEFAULT ''
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades" ADD CONSTRAINT "trades_token_address_tokens_publicKey_fk" FOREIGN KEY ("token_address") REFERENCES "public"."tokens"("publicKey") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
