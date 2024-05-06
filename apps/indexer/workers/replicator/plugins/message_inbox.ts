import { ProcessMonitor } from "monitor";
import { EVENT_NAMES } from "../../../types";
import { ProcessorPlugin } from "../plugin";
import * as schema from 'zschema'
import { getInbox } from "../../../utils";
import db from "db";
import { envelope } from "db/schema";


export class EnvelopeProcessor implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return 'Envelope';
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string) {

        const parsed = schema.envelope.safeParse(event)

        if (!parsed.success) {
            console.log("Invalid envelope", parsed.error)
            monitor.setFailed(sequence_number, {message: "Invalid Envelope", error: parsed.error});
            return
        }

        const data = parsed.data

        try {
            await db.insert(envelope).values({
                hid: `${data.hid}`,
                id: `${data.hid}`,
                inbox_name: data.inbox_name,
                ref: data.ref ?? '',
                timestamp: data.timestamp,
                reciever_pubic_key: data.receiver_public_key,
                sender_public_key: data.sender_public_key,
                content: data.content.startsWith("{") ? JSON.parse(data.content) : {
                    content: data.content
                },
                sender: data.sender,
                receiver: data.receiver,
                delegate_public_key: data.delegate_public_key
            })

        }
        catch (e) {
            monitor.setFailed(sequence_number, {message: "Could Not Store Envelope", error: e});
        }

    }

}
