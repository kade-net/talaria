import { ServerWritableStream, events } from "@kade/grpc";
import { EVENT_NAMES } from "indexer/types";
import { ProcessorPlugin } from "../processor";
import { GRPCServerErrors } from "../../constants/error";
import { envelope } from "zschema";

export class EnvelopePlugin implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return 'Envelope';
    }

    process(data: Record<any, any>, sequence_number: string): events.Event {
        try {
            // Extract event data
            if (data['event'] === undefined || data['event'] === null) {
                throw "Invalid Data";
            }
            const event_data = data['event'];

            // Attempt to parse
            const parsed = envelope.safeParse(event_data);
            if (!parsed.success) {
                console.log("Failed to parse", parsed.error);
                throw "Invalid Data";
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
                    inbox_name: parsed_data.inbox_name
                })
            });
        } catch(err) {
            console.log(err, "Could Not Get Envelope");
            throw GRPCServerErrors.NOT_PROCESS_DATA;
        }
    }
    async processStream(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.process(event, sequence_number);

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
