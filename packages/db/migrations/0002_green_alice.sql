ALTER TABLE "phonebook" ADD COLUMN "public_key" text;--> statement-breakpoint
ALTER TABLE "envelope" ADD COLUMN "sender_public_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "envelope" ADD COLUMN "reciever_public_key" text NOT NULL;