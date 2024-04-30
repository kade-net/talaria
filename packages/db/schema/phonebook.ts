import { relations } from "drizzle-orm";
import { boolean, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";


export const phonebook = pgTable("phonebook", {
    address: text("address").unique().notNull().primaryKey(),
    hid: text("hid").unique().notNull(),
    timestamp: timestamp("timestamp").notNull(),
    public_key: text("public_key")
})

export type PHONEBOOK = typeof phonebook.$inferSelect

export const phonebookRelations = relations(phonebook, ({ many, one }) => {
    return {
        contacts: many(contact, {
            relationName: "contacts"
        }),
        delegates: many(delegate, {
            relationName: "delegates"
        })
    }
})

export const contact = pgTable("contact", {
    address: text("address").notNull().primaryKey(),
    user_address: text("user_address").notNull().references(() => phonebook.address),
    accepted: boolean("accepted").notNull().default(false),
    timestamp: timestamp("timestamp").notNull(),
    envelope: json("envelope").notNull()
})

export type CONTACT = typeof contact.$inferSelect

export const contactRelations = relations(contact, ({ many, one }) => {
    return {
        user: one(phonebook, {
            fields: [contact.user_address],
            references: [phonebook.address]
        })
    }
})

export const delegate = pgTable("delegate", {
    address: text("address").notNull().primaryKey(),
    user_address: text("user_address").notNull().references(() => phonebook.address),
    timestamp: timestamp("timestamp").notNull(),
    hid: text("hid").notNull()
})

export type DELEGATE = typeof delegate.$inferSelect


export const delegateRelations = relations(delegate, ({ many, one }) => {
    return {
        user: one(phonebook, {
            fields: [delegate.user_address],
            references: [phonebook.address]
        })
    }
})
