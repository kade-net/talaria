import { events } from "@kade/grpc";
import { EVENT_NAMES } from "indexer/types";
import { ServerWritableStream } from "@kade/grpc";

export abstract class ProcessorPlugin {
    abstract name(): EVENT_NAMES

    abstract process(data: Record<any, any>, sequence_number: string): events.Event

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
