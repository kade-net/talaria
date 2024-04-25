import { ServerWritableStream, events } from "@kade/grpc";
import { EVENT_NAMES } from "indexer/types";
import { ProcessorPlugin } from "../processor";
import { GRPCServerErrors } from "../../constants/error";
import { delegate_register_event, delegate_remove_event } from "zschema";

export class DelegateRegisterEvent implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return 'DelegateRegisterEvent';
    }

    process(data: Record<any, any>, sequence_number: string): events.Event {
        try {
            // Extract event data
            if (data['event'] === undefined || data['event'] === null) {
                throw "Invalid Data";
            }
            const event_data = data['event'];

            // Attempt to parse
            const parsed = delegate_register_event.safeParse(event_data);
            if (!parsed.success) {
                console.log("Failed to parse", parsed.error);
                throw "Invalid Data";
            }
            const parsed_data = parsed.data;
            return new events.Event({
                event_type: 'DelegateRegisterEvent',
                sequence_number: parseInt(sequence_number),
                delegate_register_event: new events.DelegateRegisterEvent({
                    owner: parsed_data.owner,
                    delegate_hid: parsed_data.delegate_hid,
                    user_hid: parsed_data.user_hid,
                    delegate_address: parsed_data.delegate_address
                })
            });
        } catch(err) {
            console.log(err, "Could Not Get DelegateRegisterEvent");
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


export class DelegateRemoveEventPlugin implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return 'DelegateRemoveEvent';
    }

    process(data: Record<any, any>, sequence_number: string): events.Event {
        try {
            // Extract event data
            if (data['event'] === undefined || data['event'] === null) {
                throw "Invalid Data";
            }
            const event_data = data['event'];

            // Attempt to parse
            const parsed = delegate_remove_event.safeParse(event_data);
            if (!parsed.success) {
                console.log("Failed to parse", parsed.error);
                throw "Invalid Data";
            }
            const parsed_data = parsed.data;
            return new events.Event({
                event_type: 'DelegateRemoveEvent',
                sequence_number: parseInt(sequence_number),
                delegate_remove_event: new events.DelegateRemoveEvent({
                    owner_address: parsed_data.owner_address,
                    delegate_hid: parsed_data.delegate_hid,
                    owner_hid: parsed_data.owner_hid,
                    delegate_address: parsed_data.delegate_address
                })
            });
        } catch(err) {
            console.log(err, "Could Not Get DelegateRemoveEvent");
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


