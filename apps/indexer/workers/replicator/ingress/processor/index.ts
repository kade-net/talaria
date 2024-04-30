import talaria, { events, sendUnaryData } from "@kade/hermes-tunnel";
import { IngressPlugin } from "../plugins/definitions";
import lmdb from "node-lmdb";
import _ from "lodash";
const {isNull} = _;

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class DataProcessor {
    private dbi: lmdb.Dbi
    private env: lmdb.Env
    private registeredPlugins: IngressPlugin[] = [];

    constructor(dbi: lmdb.Dbi, env: lmdb.Env) {
        this.dbi = dbi;
        this.env = env;
    }

    registerPlugin(plugin: IngressPlugin) {
        this.registeredPlugins.push(plugin);
    }

    async singleEvent(call: talaria.ServerUnaryCall<events.EventRequest, events.Event>, callback: sendUnaryData<events.Event>) {
        try {
            // Getting the sequence number from the request
            const request = call.request.toObject()
            const r_sequence_number = request.sequence_number ?? 0
            const _sequence_number = `000000000${r_sequence_number}`
            const sequence_number = _sequence_number.substring(_sequence_number.length - 9)

            // Getting data at sequence
            const txn = this.env.beginTxn()
            const value = txn.getBinary(this.dbi, sequence_number)
            txn.commit()
            if (isNull(value)) {
                callback(new Error("No data found"), null)
                return
            }

            // Get data at sequence number from lama (if not their throw error)
            const data = JSON.parse(value.toString())
            const event_type = data.type
            const event_data = JSON.parse(data.event)

            // Choose plugin to handle data
            let chosenPlugin = this.registeredPlugins.find((p) => p.name === event_type)
            if (chosenPlugin === undefined) {
                callback(new Error(`No plugin found for event :: ${event_type}`), null);
            } else {
                // Process data and return correct thing
                await chosenPlugin.processSingle(callback, event_data, sequence_number)
            }

        } catch(err) {
            callback(new Error("Something went wrong while processing data"), null);
        }
    }

    async process(call: talaria.ServerWritableStream<events.EventsRequest, events.Event>, _last_read?: number) {
        // Getting last read as a string
        console.log("Processing data", _last_read)
        let last_read = "000000000"
        if (_last_read) {
            const s = `000000000${_last_read}`
            last_read = s.substring(s.length - 9)
        }
        console.log("Last read::", last_read)

        // Start reading lama from event with last read as key going forward
        const txn = this.env.beginTxn({
            readOnly: true
        })
        const cursor = new lmdb.Cursor(txn, this.dbi)
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
                const chosenPlugin = this.registeredPlugins.find(p => p.name() === event_type)

                if (chosenPlugin) {
                    try {
                        await chosenPlugin.process(call, event_data, key)
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
