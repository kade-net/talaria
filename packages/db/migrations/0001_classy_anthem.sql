ALTER TABLE "contact" DROP CONSTRAINT "contact_user_address_phonebook_address_fk";
--> statement-breakpoint
ALTER TABLE "delegate" DROP CONSTRAINT "delegate_user_address_phonebook_address_fk";
--> statement-breakpoint
ALTER TABLE "envelope" DROP CONSTRAINT "envelope_inbox_name_inbox_id_fk";
--> statement-breakpoint
ALTER TABLE "inbox" DROP CONSTRAINT "inbox_owner_address_phonebook_address_fk";
ALTER TABLE "inbox" DROP CONSTRAINT "inbox_initiator_address_phonebook_address_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contact" ADD CONSTRAINT "contact_user_address_phonebook_address_fk" FOREIGN KEY ("user_address") REFERENCES "phonebook"("address") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "delegate" ADD CONSTRAINT "delegate_user_address_phonebook_address_fk" FOREIGN KEY ("user_address") REFERENCES "phonebook"("address") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "envelope" ADD CONSTRAINT "envelope_inbox_name_inbox_id_fk" FOREIGN KEY ("inbox_name") REFERENCES "inbox"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inbox" ADD CONSTRAINT "inbox_owner_address_phonebook_address_fk" FOREIGN KEY ("owner_address") REFERENCES "phonebook"("address") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "inbox" ADD CONSTRAINT "inbox_initiator_address_phonebook_address_fk" FOREIGN KEY ("initiator_address") REFERENCES "phonebook"("address") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
