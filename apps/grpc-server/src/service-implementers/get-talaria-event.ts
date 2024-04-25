import {events, ServerUnaryCall, sendUnaryData} from "@kade/grpc";
import dataprocessor from "../processor";

export default async function getTalariaEvent(
    call: ServerUnaryCall<events.EventRequest, events.Event>, 
    callback: sendUnaryData<events.Event>) {
    // Extract sequence number and convert to string
    const event_request = call.request.toObject();
    let _sequence_number = `000000000${event_request.sequence_number ?? 0}`;
    let sequence_number = _sequence_number.substring(_sequence_number.length - 9);

    // Get event from dataprocessor
    const event = await dataprocessor.getEvent(sequence_number);

    // Return event
    callback(null, event);
}
