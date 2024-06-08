import { ServerWritableStream, events, sendUnaryData } from "@kade-net/hermes-tunnel";
import { EVENT_NAMES } from "../../../../types";
import { IngressPlugin } from "./definitions";
import { accept_request_event, request_event, request_inbox_register_event } from "zschema";

export class RequestInboxRegisterEventPlugin implements IngressPlugin {
    name(): EVENT_NAMES {
        return 'RequestInboxRegisterEvent';
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        try {
            // Attempt to parse
            const parsed = request_inbox_register_event.safeParse(event);
            if (!parsed.success) {
                return null;
            }
            const parsed_data = parsed.data;
            return new events.Event({
                event_type: 'RequestInboxRegisterEvent',
                sequence_number: parseInt(sequence_number),
                request_inbox_register_event: new events.RequestInboxRegisterEvent({
                    user_address: parsed_data.user_address,
                    timestamp: parsed_data.timestamp.getTime(),
                    hid: parsed_data.hid,
                    public_key: parsed_data.public_key
                })
            });
        } catch(err) {
            console.log("Error extracting RequestInboxRegisterEvent event", err);
            return null;
        }
    }

    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number)
        if (event_data) {
            callback(null, event_data)
        }
        else {
            console.log("Error processing RequestInboxRegisterEvent event");
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
            console.log("Error parsing RequestInboxRegisterEvent event")
        }
    }
}

export class RequestEventPlugin implements IngressPlugin {
    name(): EVENT_NAMES {
        return 'RequestEvent';
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        try {
            // Attempt to parse
            const parsed = request_event.safeParse(event);
            if (!parsed.success) {
                return null;
            }
            const parsed_data = parsed.data;
            return new events.Event({
                event_type: 'RequestEvent',
                sequence_number: parseInt(sequence_number),
                request_event: new events.RequestEvent({
                    requester_address: parsed_data.requester_address,
                    inbox_owner_address: parsed_data.inbox_owner_address,
                    envelope: parsed_data.envelope,
                    timestamp: parsed_data.timestamp.getTime(),
                    inbox_name: parsed_data.inbox_name
                })
            });
        } catch(err) {
            console.log("Error extracting RequestEvent event", err);
            return null;
        }
    }

    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number)
        if (event_data) {
            callback(null, event_data)
        }
        else {
            console.log("Error processing RequestEvent event");
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
            console.log("Error parsing RequestEvent event")
        }
    }
}

export class AcceptRequestEventPlugin implements IngressPlugin {
    name(): EVENT_NAMES {
        return 'AcceptRequestEvent';
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        try {
            // Attempt to parse
            const parsed = accept_request_event.safeParse(event);
            if (!parsed.success) {
                return null;
            }
            const parsed_data = parsed.data;
            return new events.Event({
                event_type: 'AcceptRequestEvent',
                sequence_number: parseInt(sequence_number),
                accept_request_event: new events.AcceptRequestEvent({
                    requester_address: parsed_data.requester_address,
                    inbox_owner_address: parsed_data.inbox_owner_address,
                    timestamp: parsed_data.timestamp.getTime(),
                    inbox_name: parsed_data.inbox_name
                })
            });
        } catch(err) {
            console.log("Error extracting AcceptRequestEvent event", err);
            return null;
        }
    }

    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number)
        if (event_data) {
            callback(null, event_data)
        }
        else {
            console.log("Error processing AcceptRequestEvent event");
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
            console.log("Error parsing AcceptRequestEvent event")
        }
    }
}

export class RequestDeniedEventPlugin implements IngressPlugin {
    name(): EVENT_NAMES {
        return 'RequestDeniedEvent';
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        try {
            // Attempt to parse
            const parsed = accept_request_event.safeParse(event);
            if (!parsed.success) {
                return null;
            }
            const parsed_data = parsed.data;
            return new events.Event({
                event_type: 'RequestDeniedEvent',
                sequence_number: parseInt(sequence_number),
                request_denied_event: new events.RequestDeniedEvent({
                    requester_address: parsed_data.requester_address,
                    inbox_owner_address: parsed_data.inbox_owner_address,
                    timestamp: parsed_data.timestamp.getTime(),
                    inbox_name: parsed_data.inbox_name
                })
            });
        } catch(err) {
            console.log("Error extracting RequestDeniedEvent event", err);
            return null;
        }
    }

    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number)
        if (event_data) {
            callback(null, event_data)
        }
        else {
            console.log("Error processing RequestDeniedEvent event");
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
            console.log("Error parsing RequestDeniedEvent event")
        }
    }
}

export class RequestRemoveFromPhonebookEventPlugin implements IngressPlugin {
    name(): EVENT_NAMES {
        return 'RequestRemoveFromPhoneBookEvent';
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        try {
            // Attempt to parse
            const parsed = accept_request_event.safeParse(event);
            if (!parsed.success) {
                return null;
            }
            const parsed_data = parsed.data;
            return new events.Event({
                event_type: 'RequestRemoveFromPhoneBookEvent',
                sequence_number: parseInt(sequence_number),
                request_remove_from_phonebook_event: new events.RequestRemoveFromPhonebookEvent({
                    requester_address: parsed_data.requester_address,
                    inbox_owner_address: parsed_data.inbox_owner_address,
                    timestamp: parsed_data.timestamp.getTime(),
                    inbox_name: parsed_data.inbox_name
                })
            });
        } catch(err) {
            console.log("Error extracting RequestRemoveFromPhonebook event", err);
            return null;
        }
    }

    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number)
        if (event_data) {
            callback(null, event_data)
        }
        else {
            console.log("Error processing RequestRemoveFromPhonebook event");
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
            console.log("Error parsing RequestRemoveFromPhonebook event")
        }
    }
}
