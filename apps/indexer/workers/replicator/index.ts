import { LevelDB } from "@kade-net/lama"
import { ProcessMonitor } from "monitor"
import { DataProcessor } from "./writer"

import { AcceptRequestEventProcessor, DelegateRegisterEventProcessor, DelegateRemoveEventProcessor, EnvelopeProcessor, RequestDeniedEventProcessor, RequestEventProcessor, RequestInboxRegisterEventProcessor, RequestRemoveFromPhoneBookEventProcessor } from './plugins'
import { LoggerProcessor } from "./plugins/logger"

const db = await LevelDB.init()
export const monitor = await ProcessMonitor.init()
const dataProcessor = new DataProcessor(db._db.dbi, db._db.env, monitor)

dataProcessor.registerPlugin(new AcceptRequestEventProcessor())
dataProcessor.registerPlugin(new DelegateRegisterEventProcessor())
dataProcessor.registerPlugin(new DelegateRemoveEventProcessor())
dataProcessor.registerPlugin(new EnvelopeProcessor())
dataProcessor.registerPlugin(new RequestDeniedEventProcessor())
dataProcessor.registerPlugin(new RequestEventProcessor())
dataProcessor.registerPlugin(new RequestInboxRegisterEventProcessor())
dataProcessor.registerPlugin(new RequestRemoveFromPhoneBookEventProcessor())
dataProcessor.registerPlugin(new LoggerProcessor())


export default dataProcessor
