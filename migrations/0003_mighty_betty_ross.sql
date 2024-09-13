ALTER TABLE "orders" ALTER COLUMN "token_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "value" SET DATA TYPE varchar(50);