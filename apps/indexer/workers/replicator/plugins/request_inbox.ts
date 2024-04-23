import { ProcessMonitor } from "monitor";
import { EVENT_NAMES } from "../../../types";
import { ProcessorPlugin } from "../plugin";
import * as schema from 'zschema'
import db, { orm } from "db";
import { contact, delegate, inbox, phonebook } from "db/schema";

export class RequestInboxRegisterEventProcessor extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "RequestInboxRegisterEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string) {

        const parsed = schema.request_inbox_register_event.safeParse(event)

        if (!parsed.success) {
            console.log("Invalid request inbox register event", parsed.error)
            monitor.setFailed(sequence_number, {message: "Invalid request inbox register event", error: parsed.error}); 
            return
        }

        const data = parsed.data

        try {
            await db.insert(phonebook).values({
                address: data.user_address,
                hid: `${data.hid}`,
                timestamp: data.timestamp
            })

            console.log("Request Inbox Register Event processed")
        }
        catch (e) {
            console.log(`Something went wrong ::`, e)
            monitor.setFailed(sequence_number, {message: "Could Not Insert Request Inbox Event", error: e});
        }

    }
}


export class RequestEventProcessor extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "RequestEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string) {

        const parsed = schema.request_event.safeParse(event)

        if (!parsed.success) {
            console.log("Unable to parse") // TODO: add appropriate error handling 
            return
        }

        const data = parsed.data

        try {

            await db.transaction(async (txn) => {

                await txn.insert(inbox).values({
                    hid: data.inbox_name,
                    id: data.inbox_name,
                    initiator_address: data.requester_address,
                    owner_address: data.inbox_owner_address,
                    timestamp: data.timestamp
                })

                await txn.insert(contact).values({
                    address: data.requester_address,
                    user_address: data.inbox_owner_address,
                    envelope: data.envelope, // TODO: possible parsing of the envelope content needs to happen here
                    timestamp: data.timestamp,
                })
            })

            // TODO: additional handling of some kind
        }
        catch (e) {
            // TODO: deal with error
            console.log(`Something wen't wrong::`, e)
        }
    }

}


export class AcceptRequestEventProcessor extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "AcceptRequestEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string) {


        const parsed = schema.accept_request_event.safeParse(event)

        if (!parsed.success) {
            console.log("SOmething went wrong::", parsed.error) // TODO: some form of error handling
            return
        }

        const data = parsed.data

        try {
            await db.transaction(async (txn) => {
                await txn.update(contact).set({
                    accepted: true
                })
                    .where(orm.eq(contact.address, data.requester_address))

                await txn.update(inbox).set({
                    active: true
                })
                    .where(orm.eq(inbox.id, data.inbox_name))
            })
        }
        catch (e) {
            console.log("Something went wrong::", e)
        }
    }

}


export class RequestDeniedEventProcessor extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "RequestDeniedEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string) {

        const parsed = schema.request_denied_event.safeParse(event)

        if (!parsed.success) {
            console.log("Something went wrong::", parsed.error)
            return
        }

        const data = parsed.data

        try {
            await db.transaction(async (txn) => {
                await txn.delete(inbox).where(orm.eq(inbox.id, data.inbox_name))

                await txn.delete(contact).where(
                    orm.and(
                        orm.eq(contact.address, data.requester_address),
                        orm.eq(contact.user_address, data.inbox_owner_address)
                    )
                )
            })

            console.log("DOne deleting") // TODO: add extra handling here
        }
        catch (e) {
            console.log("Something went wrong::", e)
        }

    }

}

export class RequestRemoveFromPhoneBookEventProcessor extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "RequestRemoveFromPhoneBookEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string) {

        const parsed = schema.request_remove_from_phonebook_event.safeParse(event)

        if (!parsed.success) {
            console.log(`Something went wrong::`, parsed.error) // TODO: add extra error handling
            return
        }


        try {
            await db.transaction(async (txn) => {
                await txn.delete(contact).where(
                    orm.and(
                        orm.eq(contact.address, parsed.data.requester_address),
                        orm.eq(contact.user_address, parsed.data.inbox_owner_address)
                    )
                )
            })

            // TODO: do some other stuff here
        }
        catch (e) {
            console.log(`Something went wrong::`, e)
        }

    }


}

export class DelegateRegisterEventProcessor extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "DelegateRegisterEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string) {

        const parsed = schema.delegate_register_event.safeParse(event)

        if (!parsed.success) {
            console.log("Something went wrong::", parsed.error) // TODO: do something
            return
        }

        const data = parsed.data

        try {
            await db.insert(delegate).values({
                address: data.delegate_address,
                hid: `${data.delegate_hid}`,
                user_address: data.owner,
                timestamp: new Date()
            })

            // TODO: handle this
        }
        catch (e) {
            // TODO: hadle this 
        }

    }

}

export class DelegateRemoveEventProcessor extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "DelegateRemoveEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string) {
        const parsed = schema.delegate_remove_event.safeParse(event)

        if (!parsed.success) {
            console.log("Unable to parse data ::", parsed.error)
            return
        }

        const data = parsed.data

        try {
            await db.delete(delegate).where(
                orm.eq(
                    delegate.address,
                    data.delegate_address
                )
            )
        }
        catch (e) {
            console.log(`Something went wrong::`, e)
        }
    }

}
