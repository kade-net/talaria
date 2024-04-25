import { Lama } from "lama/lama";
import { DataProcessor } from "./data-processor";
import { EnvelopePlugin } from "./plugin/envelope";
import { AcceptRequestEventPlugin, RequestDeniedEventPlugin, RequestEventPlugin, RequestInboxRegisterEventPlugin, RequestRemoveFromPhonebookEventPlugin } from "./plugin/request";
import { DelegateRegisterEvent, DelegateRemoveEventPlugin } from "./plugin/delegate";

let eventLama = await Lama.init("events");
const dataprocessor = new DataProcessor(eventLama);

// Register plugins
dataprocessor.registerPlugin(new EnvelopePlugin());
dataprocessor.registerPlugin(new RequestInboxRegisterEventPlugin());
dataprocessor.registerPlugin(new RequestEventPlugin());
dataprocessor.registerPlugin(new AcceptRequestEventPlugin());
dataprocessor.registerPlugin(new RequestDeniedEventPlugin());
dataprocessor.registerPlugin(new RequestRemoveFromPhonebookEventPlugin());
dataprocessor.registerPlugin(new DelegateRegisterEvent());
dataprocessor.registerPlugin(new DelegateRemoveEventPlugin());

export default dataprocessor;
