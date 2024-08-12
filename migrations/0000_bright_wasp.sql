CREATE TABLE IF NOT EXISTS "users" (
	"chatId" bigserial PRIMARY KEY NOT NULL,
	"secretKey" varchar(256),
	"state" text
);
