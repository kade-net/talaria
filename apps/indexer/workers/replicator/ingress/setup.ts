import { LevelDB } from "@kade-net/lama";
import { DataProcessor } from "./processor";
import { EnvelopePlugin } from "./plugins/envelope";
import { AcceptRequestEventPlugin, RequestDeniedEventPlugin, RequestEventPlugin, RequestInboxRegisterEventPlugin, RequestRemoveFromPhonebookEventPlugin } from "./plugins/request";
import { DelegateRegisterEvent, DelegateRemoveEventPlugin } from "./plugins/delegate";

const db = await LevelDB.init();
const dataprocessor = new DataProcessor(db._db.dbi, db._db.env);

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
