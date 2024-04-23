import { ProcessMonitor } from "monitor";
import { EVENT_NAMES } from "../../../types";
import { ProcessorPlugin } from "../plugin";


export class LoggerProcessor extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return 'LOG'
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string) {
        console.log("Current Sequence::", sequence_number)
        console.log("Event::", event)

    }

}