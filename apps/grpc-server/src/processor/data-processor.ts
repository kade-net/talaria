import { ServerWritableStream, events } from "@kade/grpc";
import { ProcessorPlugin } from "./processor";
import { GRPCServerErrors } from "../constants/error";
import { Lama } from "lama/lama";
import lmdb from "node-lmdb";
import _ from "lodash";
const {isNull} = _;

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class DataProcessor {
    events: Lama 
    private plugins: ProcessorPlugin[] = [];

    constructor(events: Lama) {
        this.events = events;
    }

    registerPlugin(plugin: ProcessorPlugin) {
        this.plugins.push(plugin);
    }

    async getEvent(sequence_number: string): Promise<events.Event> {
        try {
            // Get data at sequence number from lama (if not their throw error)
            const data = await this.events.get(sequence_number);
            if (data === null) {
               throw GRPCServerErrors.NO_DATA; 
            }
            const json = JSON.parse(data);
            
            // Choose plugin to handle data
            let chosenPlugin = this.plugins.find((p) => p.name === json['type'])
            if (chosenPlugin === undefined) {
                console.log(`Could Not Find Plugin To Process json['type'] event`);
                throw "Could Not Find Plugin";
            }
            
            // Process data and return correct thing
            let eventData = chosenPlugin.process(json, sequence_number)
            return eventData;
        } catch(err) {
            if (err === GRPCServerErrors.NO_DATA) {
                throw GRPCServerErrors.NO_DATA;
            }

            console.log("Could Not Process Event At Sequence Number", sequence_number);
            throw GRPCServerErrors.NOT_PROCESS_DATA;
        }
    }

    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, _last_read?: number) {
        // Getting last read as a string
        console.log("Processing data", _last_read)
        let last_read = "000000000"
        if (_last_read) {
            const s = `000000000${_last_read}`
            last_read = s.substring(s.length - 9)
        }
        console.log("Last read::", last_read)

        // Start reading lama from event with last read as key going forward
        const txn = this.events.env.beginTxn({
            readOnly: true
        })
        const cursor = new lmdb.Cursor(txn, this.events.dbi)
        const atRange = last_read == "000000000" ? {} : cursor.goToRange(last_read)
        console.log("At Range::", atRange)
        // No more data
        if (!atRange) {
            console.log("No more data")
            cursor.close()
            txn.commit()
            await sleep(60_000)
            console.log("resuming")
            call.end()
            return
        }
        
        // Continuously getting data
        let key, value: Buffer | null;
        while ((key = cursor.goToNext()) !== null) {
            console.log("key::", key)
            value = cursor.getCurrentBinary()
            if (value && !isNull(value)) {
                const data = JSON.parse(value.toString())
                const event_type = data.type
                const requestedEventType = call.request.toObject().event_type
                if ((requestedEventType?.length ?? 0) > 3 && event_type !== requestedEventType) {
                    console.log("Skipping event::", event_type)
                    continue
                }
                const signature = data.signature
                const event_data = JSON.parse(data.event)
                const chosenPlugin = this.plugins.find(p => p.name() === event_type)

                if (chosenPlugin) {
                    try {
                        await chosenPlugin.processStream(call, event_data, key)
                    }
                    catch (e) {
                        console.log("Something went wrong while processing data::", e)
                    }
                }
                last_read = key
            }
        }

        cursor.close()
        txn.commit()
        await sleep(60_000)
        console.log("resuming")
        await this.process(call, parseInt(last_read))
    }
}
