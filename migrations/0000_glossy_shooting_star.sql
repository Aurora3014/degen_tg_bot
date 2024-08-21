CREATE TABLE IF NOT EXISTS "tokens" (
	"public_key" varchar(50) PRIMARY KEY NOT NULL,
	"chat_id" bigint NOT NULL,
	"name" varchar(20) NOT NULL,
	"symbol" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trades" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"chat_id" bigint NOT NULL,
	"token_address" varchar(50) NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"is_buy" boolean NOT NULL,
	"amount_in" bigint NOT NULL,
	"amount_out" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"chat_id" bigserial PRIMARY KEY NOT NULL,
	"public_key" varchar(50) DEFAULT '',
	"secret_key" varchar(256) DEFAULT '',
	"state" text DEFAULT '',
	"params" text DEFAULT '',
	"buy_option1" double precision DEFAULT 1 NOT NULL,
	"buy_option2" double precision DEFAULT 2 NOT NULL,
	"sell_option1" double precision DEFAULT 1 NOT NULL,
	"sell_option2" double precision DEFAULT 2 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tokens" ADD CONSTRAINT "tokens_chat_id_users_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."users"("chat_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades" ADD CONSTRAINT "trades_chat_id_users_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."users"("chat_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
