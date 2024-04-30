import { ServerWritableStream, events, sendUnaryData } from "@kade-net/hermes-tunnel";
import { EVENT_NAMES } from "../../../../types";
import { IngressPlugin } from "./definitions";
import { envelope } from "zschema";

export class EnvelopePlugin implements IngressPlugin {
    name(): EVENT_NAMES {
        return 'Envelope';
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        try {
            // Attempt to parse
            const parsed = envelope.safeParse(event);
            if (!parsed.success) {
                return null;
            }
            const parsed_data = parsed.data;
            return new events.Event({
                event_type: 'Envelope',
                sequence_number: parseInt(sequence_number),
                envelope: new events.Envelope({
                    sender: parsed_data.sender,
                    receiver: parsed_data.receiver,
                    content: parsed_data.content,
                    timestamp: parsed_data.timestamp.getTime(),
                    hid: parsed_data.hid,
                    ref: parsed_data.ref,
                    inbox_name: parsed_data.inbox_name,
                    receiver_public_key: parsed_data.receiver_public_key,
                    sender_public_key: parsed_data.sender_public_key
                })
            });
        } catch(err) {
            return null;
        }
    }

    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number)
        if (event_data) {
            callback(null, event_data)
        }
        else {
            callback(new Error("Error parsing event"), null)
        }
    }

    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number)
        if (event_data) {

            call.write(event_data, (err: any) => {
                if (err) {
                    console.log(err)
                }
            })
        }
        else {
            console.log("Error parsing event")
        }
    }
}
