CREATE TABLE IF NOT EXISTS "orders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"chat_id" bigint NOT NULL,
	"token_id" bigint NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"type" varchar(30) NOT NULL,
	"value" double precision NOT NULL,
	"is_closed" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_key" varchar(50) NOT NULL,
	"chat_id" bigint NOT NULL,
	"name" varchar(20) NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"total_spent_sol" bigint NOT NULL,
	"max_price" bigint DEFAULT 0 NOT NULL
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
	"buy_option1" double precision DEFAULT 0.00001 NOT NULL,
	"buy_option2" double precision DEFAULT 0.00002 NOT NULL,
	"sell_option1" double precision DEFAULT 1 NOT NULL,
	"sell_option2" double precision DEFAULT 2 NOT NULL,
	"buy_slippage" double precision DEFAULT 1 NOT NULL,
	"sell_slippage" double precision DEFAULT 1 NOT NULL,
	"priority_fee" double precision DEFAULT 0.001 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_chat_id_users_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."users"("chat_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
