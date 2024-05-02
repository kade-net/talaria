import { DELEGATE, PHONEBOOK, envelope, inbox, phonebook } from "db/schema"
import { INBOX_TYPE, PaginationArg, Resolver, SORT_ORDER } from "../../../types"
import db, { orm } from "db"


interface ResolverMap {
    Query: {
        phoneBook: Resolver<never, { address: string }, never>
        inboxHistory: Resolver<never, PaginationArg & { inbox_name: string, sort: SORT_ORDER, timestamp: number }, never>
        inboxes: Resolver<never, PaginationArg & { address: string, sort: SORT_ORDER, active: boolean, type: INBOX_TYPE }, never>
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
                    return ops.and(
                        ops.eq(fields.inbox_name, args.inbox_name),
                        args.timestamp ? ops.gte(fields.timestamp, new Date(args.timestamp)) : undefined
                    ) 
                },
                orderBy: orm.asc(phonebook.timestamp),
                offset: ((args?.pagination?.size ?? 0) * (args?.pagination?.page ?? 0)),
                limit: args?.pagination?.size ?? 20
            })

            // TODO: handle this properly
            return envelopes?.map((p) => ({
                ...p,
                reciever_public_key: p.reciever_pubic_key
            })) ?? []
        },
        inboxes: async (_, args, __) => {
            const inboxes = await db.query.inbox.findMany({
                where(fields, ops) {
                    if (args.active) {
                        return ops.and(ops.or(
                            ops.eq(fields.initiator_address, args.address),
                            ops.eq(fields.owner_address, args.address),
                        ), ops.eq(fields.active, true))
                    } else {
                        if (args.type === "SENT") {
                            return orm.and(
                                ops.eq(fields.initiator_address, args.address),
                                ops.eq(fields.active, false)
                            )
                        } else {
                            return orm.and(
                                ops.eq(fields.owner_address, args.address),
                                ops.eq(fields.active, false)
                            )
                        }
                    }
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