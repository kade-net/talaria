import { lt, sql } from "drizzle-orm";
import { contact, delegate, envelope, phonebook } from "./schema";
import db from ".";

const addressSize = 66;

export const addressTransfomer = (p: string) => {
    const address = p
    // Check if address is less than 66 char long
    if (typeof p == 'string' && p.length < addressSize) {
        // Add the necessary padding
        let paddingAmount = addressSize - p.length;

        // Add padding
        let padding = "0".repeat(paddingAmount);
        const newAddress = p.replace("0x", "0x" + padding);
        return newAddress;
    }
    return address
}


export default async function getBadPhoneAddressesFromDB(): Promise<string[]> {
    try {
        let results = await db.select({
            address: phonebook.address
        }).from(phonebook)
        .where(sql`length(address) < ${addressSize}`)
        
        console.log("Phonebook addresses to be updated are: ", results);
        let addresses: string[] = [];

        for (let i = 0; i < results.length; i++) {
            addresses.push(results[i]['address']);
        }
        
        return addresses;
    } catch(err) {
        console.log(err);
        throw "Could Not Get Addresses";
    }
}

export async function getBadPhonePubKeyFromDB(): Promise<string[]> {
    try {
        let results = await db.select({
            public_key: phonebook.public_key
        }).from(phonebook)
        .where(sql`length(public_key) < ${addressSize}`)
        
        console.log("Phonebook pub keys to be updated are: ", results);
        let addresses: string[] = [];

        for (let i = 0; i < results.length; i++) {
            let res = results[i];
            if (res) {
                addresses.push(res['public_key']!);
            }
        }
        
        return addresses;
    } catch(err) {
        console.log(err);
        throw "Could Not Get Phonebook Pub keys";
    }
}

export async function getBadContactAddrFromDB(): Promise<string[]> {
    try {
        let results = await db.select({
            address: contact.address
        }).from(contact)
        .where(sql`length(address) < ${addressSize}`)
        
        console.log("Contact addresses to be updated are: ", results);
        let addresses: string[] = [];

        for (let i = 0; i < results.length; i++) {
            let res = results[i];
            if (res) {
                addresses.push(res['address']!);
            }
        }
        
        return addresses;
    } catch(err) {
        console.log(err);
        throw "Could Not Get Contact Addresses";
    }
}

export async function getBadAddrPubKeyDelegateFromDB(): Promise<{address: string, public_key: string}[]> {
    try {
        let results = await db.select({
            address: delegate.address,
            public_key: delegate.public_key
        }).from(delegate)
        .where(sql`length(address) < ${addressSize} OR length(public_key) < ${addressSize}`)
        
        console.log("Delegate addresses or pub keys to be updated are: ", results);
        let addresses: {address: string, public_key: string}[] = [];

        for (let i = 0; i < results.length; i++) {
            let res = results[i];
            if (res) {
                addresses.push({address: res['address'], public_key: res['public_key']});
            }
        }
        
        return addresses;
    } catch(err) {
        console.log(err);
        throw "Could Not Get Delegate Addresses";
    }
}

export async function getBadEnvelopeKeysFromDB(): Promise<{sender_public_key: string, reciever_public_key: string, sender: string, receiver: string, delegate_public_key: string}[]> {
    try {
        let results = await db.select({
            sender_public_key: envelope.sender_public_key,
            sender: envelope.sender,
            receiver: envelope.receiver,
            delegate_public_key: envelope.delegate_public_key,
            reciever_public_key: envelope.reciever_pubic_key
        }).from(envelope)
        .where(sql`length(sender_public_key) < ${addressSize} OR length(sender) < ${addressSize} OR length(receiver) < ${addressSize} OR length(delegate_public_key) < ${addressSize} OR length(reciever_public_key) < ${addressSize}`)
        
        console.log("Envelope addresses to be updated are: ", results);
        let addresses: {sender_public_key: string, reciever_public_key: string, sender: string, receiver: string, delegate_public_key: string}[] = [];

        for (let i = 0; i < results.length; i++) {
            let res = results[i];
            if (res) {
                addresses.push({sender_public_key: res['sender_public_key'], reciever_public_key: res['reciever_public_key'], sender: res['sender'], receiver: res['receiver'], delegate_public_key: res['delegate_public_key'] ?? ""});
            }
        }
        
        return addresses;
    } catch(err) {
        console.log(err);
        throw "Could Not Get Envelope Addresses";
    }
}