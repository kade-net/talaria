CREATE TABLE IF NOT EXISTS "contact" (
	"address" text PRIMARY KEY NOT NULL,
	"user_address" text NOT NULL,
	"accepted" boolean DEFAULT false NOT NULL,
	"timestamp" timestamp NOT NULL,
	"envelope" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "delegate" (
	"address" text PRIMARY KEY NOT NULL,
	"user_address" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"hid" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "phonebook" (
	"address" text PRIMARY KEY NOT NULL,
	"hid" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	CONSTRAINT "phonebook_address_unique" UNIQUE("address"),
	CONSTRAINT "phonebook_hid_unique" UNIQUE("hid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "envelope" (
	"id" text PRIMARY KEY NOT NULL,
	"ref" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"hid" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inbox" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_address" text NOT NULL,
	"initiator_address" text NOT NULL,
	"timestamp" text NOT NULL,
	"hid" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contact" ADD CONSTRAINT "contact_user_address_phonebook_address_fk" FOREIGN KEY ("user_address") REFERENCES "phonebook"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "delegate" ADD CONSTRAINT "delegate_user_address_phonebook_address_fk" FOREIGN KEY ("user_address") REFERENCES "phonebook"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inbox" ADD CONSTRAINT "inbox_owner_address_phonebook_address_fk" FOREIGN KEY ("owner_address") REFERENCES "phonebook"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inbox" ADD CONSTRAINT "inbox_initiator_address_phonebook_address_fk" FOREIGN KEY ("initiator_address") REFERENCES "phonebook"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
