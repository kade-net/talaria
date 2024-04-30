import { boolean, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { phonebook } from "./phonebook";
import { relations } from "drizzle-orm";


export const inbox = pgTable("inbox", {
    id: text("id").notNull().primaryKey(), // follows the convention inbox_owner_address::delegate_address
    owner_address: text("owner_address").notNull().references(() => phonebook.address),
    initiator_address: text("initiator_address").notNull().references(() => phonebook.address),
    timestamp: timestamp("timestamp").notNull(),
    hid: text("hid").notNull(),
    active: boolean("active").notNull().default(false)
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
    inbox_name: text("inbox_name").notNull().references(() => inbox.id),
    sender_public_key: text("sender_public_key").notNull(),
    reciever_pubic_key: text("reciever_public_key").notNull(),
    content: json("content")
})

export type ENVELOPE = typeof envelope.$inferSelect