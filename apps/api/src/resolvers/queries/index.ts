import { DELEGATE, PHONEBOOK, envelope, inbox, phonebook } from "db/schema"
import { PaginationArg, Resolver, SORT_ORDER } from "../../../types"
import db, { orm } from "db"


interface ResolverMap {
    Query: {
        phoneBook: Resolver<never, { address: string }, never>
        inboxHistory: Resolver<never, PaginationArg & { inbox_name: string, sort: SORT_ORDER }, never>
        inboxes: Resolver<never, PaginationArg & { address: string, sort: SORT_ORDER }, never>
    },
    PhoneBook: {
        contacts: Resolver<PHONEBOOK, never, never>
        delegates: Resolver<PHONEBOOK, never, never>
    }
}


export const hermesQueries: ResolverMap = {
    Query: {
        phoneBook: async (_, args, __) => {
            const phonebook = await db.query.phonebook.findFirst({
                where(fields, ops) {
                    return ops.eq(fields.address, args.address)
                }
            })

            return phonebook ?? null
        },
        inboxHistory: async (_, args, __) => {
            const envelopes = await db.query.envelope.findMany({
                where(fields, ops) {
                    return ops.eq(fields.inbox_name, args.inbox_name)
                },
                orderBy: orm.desc(phonebook.timestamp),
                offset: ((args?.pagination?.size ?? 0) * (args?.pagination?.page ?? 0)),
                limit: args?.pagination?.size ?? 20
            })

            return envelopes ?? []
        },
        inboxes: async (_, args, __) => {
            const inboxes = await db.query.inbox.findMany({
                where(fields, ops) {
                    return ops.or(ops.eq(fields.owner_address, args.address), ops.eq(fields.initiator_address, args.address))
                },
                orderBy: orm.desc(inbox.timestamp)
            })

            return inboxes ?? []
        }
    },
    PhoneBook: {
        contacts: async (parent, args, __) => {
            const contacts = await db.query.contact.findMany({
                where(fields, ops) {
                    return ops.eq(fields.user_address, parent.address)
                }
            })

            return contacts ?? []
        },
        delegates: async (parent, args, __) => {
            const delegates = await db.query.delegate.findMany({
                where(fields, ops) {
                    return ops.eq(fields.user_address, parent.address)
                }
            })

            return delegates ?? []
        }
    }
}