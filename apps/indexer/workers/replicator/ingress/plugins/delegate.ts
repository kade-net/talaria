import { ServerWritableStream, events, sendUnaryData } from "@kade-net/hermes-tunnel";
import { EVENT_NAMES } from "../../../../types";
import { IngressPlugin } from "./definitions";
import { delegate_register_event, delegate_remove_event } from "zschema";

export class DelegateRegisterEvent implements IngressPlugin {
    name(): EVENT_NAMES {
        return 'DelegateRegisterEvent';
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        try {
            const parsed = delegate_register_event.safeParse(event);
            if (!parsed.success) {
                return null;
            }
            const parsed_data = parsed.data;
            return new events.Event({
                event_type: 'DelegateRegisterEvent',
                sequence_number: parseInt(sequence_number),
                delegate_register_event: new events.DelegateRegisterEvent({
                    owner: parsed_data.owner,
                    delegate_hid: parsed_data.delegate_hid,
                    user_hid: parsed_data.user_hid,
                    delegate_address: parsed_data.delegate_address,
                    public_key: parsed_data.public_key
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


export class DelegateRemoveEventPlugin implements IngressPlugin {
    name(): EVENT_NAMES {
        return 'DelegateRemoveEvent';
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        try {
            const parsed = delegate_remove_event.safeParse(event);
            if (!parsed.success) {
                return null;
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


