

import { eq, sql } from "drizzle-orm";
import db from ".";
import { contact, delegate, envelope, inbox, phonebook } from "./schema";
import getBadPhoneAddressesFromDB, { addressTransfomer, getBadAddrPubKeyDelegateFromDB, getBadContactAddrFromDB, getBadEnvelopeKeysFromDB, getBadPhonePubKeyFromDB } from "./select-faulty-phonebook-addresses";

async function updateTables() {
    try {
        let addresses = await updateAddressesInPhonebook();
        await updatePubkeysInPhonebook();
        await updateAddrInContact();
        await updateAddrPubKeyInDelegate();
        await updateInboxID(addresses);
        await updateEnvelopeAddresses();

        console.log("Talaria updates complete")
    } catch(err) {

    }
}

async function updateAddressesInPhonebook(): Promise<string[]> {
    try {
        // Get tables to update
        let addresses = await getBadPhoneAddressesFromDB();

        for (let i = 0; i < addresses.length; i++) {
            let addr = addresses[i];
            let goodAddr = addressTransfomer(addr);
            await db.update(phonebook).set({address: goodAddr})
                .where(eq(phonebook.address, addr))
        }

        console.log("update phonebook address complete");
        return addresses;
    } catch(err) {
        console.log(err);
        throw "Could Not update phonebook address";
    }
}

async function updatePubkeysInPhonebook() {
    try {
        // Get tables to update
        let addresses = await getBadPhonePubKeyFromDB();

        for (let i = 0; i < addresses.length; i++) {
            let addr = addresses[i];
            let goodAddr = addressTransfomer(addr);
            await db.update(phonebook).set({public_key: goodAddr})
                .where(eq(phonebook.public_key, addr))
        }

        console.log("update phonebook public key complete");
    } catch(err) {
        console.log(err);
        throw "Could Not update phonebook public key";
    }
}

async function updateAddrInContact() {
    try {
        // Get tables to update
        let addresses = await getBadContactAddrFromDB();

        for (let i = 0; i < addresses.length; i++) {
            let addr = addresses[i];
            let goodAddr = addressTransfomer(addr);
            await db.update(contact).set({address: goodAddr})
                .where(eq(contact.address, addr))
        }

        console.log("update contact address complete");
    } catch(err) {
        console.log(err);
        throw "Could not update contact address";
    }
}

async function updateAddrPubKeyInDelegate() {
    try {
        // Get tables to update
        let addresses = await getBadAddrPubKeyDelegateFromDB();

        for (let i = 0; i < addresses.length; i++) {
            let addr = addresses[i];
            let goodAddr = addressTransfomer(addr.address);
            let goodPubkey = addressTransfomer(addr.public_key)
            await db.update(delegate).set({address: goodAddr, public_key: goodPubkey})
                .where(sql`address = ${addr.address} AND public_key = ${addr.public_key}`)
        }

        console.log("update delegate address and public key complete");
    } catch(err) {
        console.log(err);
        throw "Could Not update delegate address and public key";
    }
}

async function updateInboxID(updatedAddresses: string[]) {
    try {
        for (let i = 0; i < updatedAddresses.length; i++) {
            let addr = addressTransfomer(updatedAddresses[i]);
    
            // Select id, owner_address and initiator_address of entries with id
            let results = await db.select({
                id: inbox.id,
                owner_address: inbox.owner_address,
                initiator_address: inbox.initiator_address
            }).from(inbox)
            .where(sql`owner_address = ${addr} OR initiator_address = ${addr}`);
    
            if (results.length > 0) {
                // For each result update id
                for (let j = 0; j < results.length; j++) {
                    let res = results[j];
                    let oldID = res['id'];
                    let owner_address = res['owner_address'];
                    let initiator_address = res['initiator_address'];
                    let newID = `@${owner_address}:@${initiator_address}`;
    
                    await db.update(inbox).set({id: newID, hid: newID}).where(eq(inbox.id, oldID))
                }
            }
        }
        console.log("update inbox id and hid complete");
    } catch(err) {
        throw "Could Not update inbox id and hid";
    }
}

async function updateEnvelopeAddresses() {
    try {
        // Get tables to update
        let addresses = await getBadEnvelopeKeysFromDB();

        for (let i = 0; i < addresses.length; i++) {
            let addr = addresses[i];
            let newDelegatePubkey = "";
            if (addr['delegate_public_key'] != null && addr['delegate_public_key'] != "") {
                newDelegatePubkey = addressTransfomer(addr['delegate_public_key']);
            }

            let newAddr = {
                sender_public_key: addressTransfomer(addr['sender_public_key']),
                reciever_public_key: addressTransfomer(addr['reciever_public_key']),
                sender: addressTransfomer(addr['sender']),
                receiver: addressTransfomer(addr['receiver']),
                delegate_public_key: newDelegatePubkey
            };
            await db.update(envelope).set(newAddr)
                .where(sql`sender_public_key = ${addr['sender_public_key']} AND reciever_public_key = ${addr['reciever_public_key']} AND sender = ${addr['sender']} AND receiver = ${addr['receiver']} AND delegate_public_key = ${addr['delegate_public_key']}`)
        }

        console.log("update envelope addresses complete");
    } catch(err) {
        console.log(err);
        throw "Could Not update envelope addresses";
    }
}



updateTables();