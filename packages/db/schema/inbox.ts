import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { phonebook } from "./phonebook";
import { relations } from "drizzle-orm";


export const inbox = pgTable("inbox", {
    id: text("id").notNull().primaryKey(), // follows the convention inbox_owner_address::delegate_address
    owner_address: text("owner_address").notNull().references(() => phonebook.address),
    initiator_address: text("initiator_address").notNull().references(() => phonebook.address),
    timestamp: text("timestamp").notNull(),
    hid: text("hid").notNull()
})

export type INBOX = typeof inbox.$inferSelect

export const inboxRelations = relations(inbox, ({ many, one }) => {
    return {
        owner: one(phonebook, {
            fields: [inbox.owner_address],
            references: [phonebook.address]
        }),
        envelopes: many(envelope, {
            relationName: "envelopes"
        })
    }
})

export const envelope = pgTable("envelope", {
    id: text("id").notNull().primaryKey(),
    ref: text("ref").notNull(),
    timestamp: timestamp("timestamp").notNull(),
    hid: text("hid").notNull(),
    inbox_id: text("inbox_id").notNull().references(() => inbox.id)
})

export type ENVELOPE = typeof envelope.$inferSelect