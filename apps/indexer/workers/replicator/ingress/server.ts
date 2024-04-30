import talaria, { UnimplementedTalariaServiceService, sendUnaryData, events } from "@kade/hermes-tunnel";
import dataprocessor from './setup';

class TalariaSever implements UnimplementedTalariaServiceService {
    [method: string]: talaria.UntypedHandleCall;
    async GetTalariaEvents(call: talaria.ServerWritableStream<events.EventsRequest, events.Event>) {
        const request = call.request.toObject();
        const starting_sequence_number = request.sequence_number
        try {
            await dataprocessor.process(call, starting_sequence_number)
        }
        catch (e) {
            console.log("Error::", e)
        }
        call.end()
    }

    async GetTalariaEvent(call: talaria.ServerUnaryCall<events.EventRequest, events.Event>, callback: talaria.sendUnaryData<events.Event>) {
        try {
            await dataprocessor.singleEvent(call, callback)
        }
        catch (e) {
            console.log("Error::", e)
            callback(Error("Something unexpected happened"), null)
        }
    }
}

const talariaSever = new TalariaSever()

export default talariaSever
