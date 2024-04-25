import {events,  ServerWritableStream} from "@kade/grpc";
import dataprocessor from "../processor";

export default async function getTalariaEvents(
    call: ServerWritableStream<events.EventsRequest, events.Event>) {
    // Extract sequence number and convert to string
    const event_request = call.request.toObject();
    try {
        await dataprocessor.process(call, event_request.sequence_number);
    }
    catch (e) {
        console.log("Error::", e)
    }
    call.end()
}
