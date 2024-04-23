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
            return
        }

        const data = parsed.data

        try {
            const inbox = await getInbox(data.sender, data.receiver)
            if (!inbox) {
                console.log("No inbox found")
                return
            }



        }
        catch (e) {

        }

    }

}