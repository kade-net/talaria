import talaria, { events } from '@kade/grpc';
import { EVENT_NAMES } from "../../../../types";


export abstract class IngressPlugin {

    constructor() { }

    abstract name(): EVENT_NAMES

    abstract extract(event: Record<string, any>, sequence_number: string): events.Event | null

    abstract process(call: talaria.ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string): Promise<void>

    abstract processSingle(callback: talaria.sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string): Promise<void>

}
