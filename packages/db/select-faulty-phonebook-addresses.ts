import { lt, sql } from "drizzle-orm";
import { phonebook } from "./schema";
import db from "./test-db";

const addressSize = 66;
async function getBadAddressesFromDB() {
    try {
        let results = await db.select({
            address: phonebook.address
        }).from(phonebook)
        .where(sql`length(address) < ${addressSize}`)
        console.log(results);
    } catch(err) {
        console.log(err);
    }
}

getBadAddressesFromDB();