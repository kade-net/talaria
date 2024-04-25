import { EVENT_NAMES } from "indexer/types";
import { ProcessorPlugin } from "../processor";
import { ServerWritableStream, events } from "@kade/grpc";
import { GRPCServerErrors } from "../../constants/error";
import { accept_request_event, request_event, request_inbox_register_event } from "zschema";

export class RequestInboxRegisterEventPlugin implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return 'RequestInboxRegisterEvent';
    }

    process(data: Record<any, any>, sequence_number: string): events.Event {
        try {
            // Extract event data
            if (data['event'] === undefined || data['event'] === null) {
                throw "Invalid Data";
            }
            const event_data = data['event'];

            // Attempt to parse
            const parsed = request_inbox_register_event.safeParse(event_data);
            if (!parsed.success) {
                console.log("Failed to parse", parsed.error);
                throw "Invalid Data";
            }
            const parsed_data = parsed.data;
            return new events.Event({
                event_type: 'RequestInboxRegisterEvent',
                sequence_number: parseInt(sequence_number),
                request_inbox_register_event: new events.RequestInboxRegisterEvent({
                    user_address: parsed_data.user_address,
                    timestamp: parsed_data.timestamp.getTime(),
                    hid: parsed_data.hid
                })
            });
        } catch(err) {
            console.log(err, "Could Not Get RequestInboxRegisterEvent");
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

export class RequestEventPlugin implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return 'RequestEvent';
    }

    process(data: Record<any, any>, sequence_number: string): events.Event {
        try {
            // Extract event data
            if (data['event'] === undefined || data['event'] === null) {
                throw "Invalid Data";
            }
            const event_data = data['event'];

            // Attempt to parse
            const parsed = request_event.safeParse(event_data);
            if (!parsed.success) {
                console.log("Failed to parse", parsed.error);
                throw "Invalid Data";
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
            console.log(err, "Could Not Get RequestInboxRegisterEvent");
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

export class AcceptRequestEventPlugin implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return 'AcceptRequestEvent';
    }

    process(data: Record<any, any>, sequence_number: string): events.Event {
        try {
            // Extract event data
            if (data['event'] === undefined || data['event'] === null) {
                throw "Invalid Data";
            }
            const event_data = data['event'];

            // Attempt to parse
            const parsed = accept_request_event.safeParse(event_data);
            if (!parsed.success) {
                console.log("Failed to parse", parsed.error);
                throw "Invalid Data";
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
            console.log(err, "Could Not Get AcceptRequestEvent");
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

export class RequestDeniedEventPlugin implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return 'RequestDeniedEvent';
    }

    process(data: Record<any, any>, sequence_number: string): events.Event {
        try {
            // Extract event data
            if (data['event'] === undefined || data['event'] === null) {
                throw "Invalid Data";
            }
            const event_data = data['event'];

            // Attempt to parse
            const parsed = accept_request_event.safeParse(event_data);
            if (!parsed.success) {
                console.log("Failed to parse", parsed.error);
                throw "Invalid Data";
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
            console.log(err, "Could Not Get RequestDeniedEvent");
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

export class RequestRemoveFromPhonebookEventPlugin implements ProcessorPlugin {
    name(): EVENT_NAMES {
        return 'RequestRemoveFromPhoneBookEvent';
    }

    process(data: Record<any, any>, sequence_number: string): events.Event {
        try {
            // Extract event data
            if (data['event'] === undefined || data['event'] === null) {
                throw "Invalid Data";
            }
            const event_data = data['event'];

            // Attempt to parse
            const parsed = accept_request_event.safeParse(event_data);
            if (!parsed.success) {
                console.log("Failed to parse", parsed.error);
                throw "Invalid Data";
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
            console.log(err, "Could Not Get RequestRemoveFromPhoneBookEvent");
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
