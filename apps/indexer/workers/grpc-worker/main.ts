import "dotenv/config"
import _ from "lodash"
const { isUndefined } = _
import { LevelDB } from "lama"
import { ReadProcessor } from "./read.processor"
import { Worker } from "./worker"
    ;
(async () => {
    try {
        const db = await LevelDB.init()
        const worker = new Worker(
            process.env.INDEXER_API_KEY!,
            db,
            new ReadProcessor()
        )
        const starting = process.env.STARTING_VERSION!
        const parsed = starting ? parseInt(starting) : undefined
        if (Number.isNaN(parsed) || isUndefined(parsed)) {
            throw new Error("Invalid starting version")
        }
        const v = await db.getLatestVersion()
        console.log("Starting worker with version", v)
        await worker.run(BigInt(parsed))
    }
    catch (e) {
        console.log("Something went wrong while processing data:", e)
    }
})();