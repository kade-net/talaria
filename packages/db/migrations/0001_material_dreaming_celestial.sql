ALTER TABLE "inbox" ALTER COLUMN "timestamp" SET DATA TYPE timestamp USING timestamp::timestamp without time zone;--> statement-breakpoint
ALTER TABLE "envelope" ADD COLUMN "inbox_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inbox" ADD COLUMN "active" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "envelope" ADD CONSTRAINT "envelope_inbox_name_inbox_id_fk" FOREIGN KEY ("inbox_name") REFERENCES "inbox"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
