import { z } from "zod";

const addressSize = 66;
const addressTransfomer = (p: string) => {
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
const transformStringToDate = (v: string) => new Date(parseInt(v) / 1000)

export const envelope = z.object({
    sender: z.string().transform(addressTransfomer),
    receiver: z.string().transform(addressTransfomer),
    content: z.string(),
    timestamp: z.string().transform(transformStringToDate),
    hid: z.string().transform(v => parseInt(v)),
    ref: z.string().optional(),
    inbox_name: z.string(),
    sender_public_key: z.string(),
    receiver_public_key: z.string(),
    delegate_public_key: z.string()
})

export const request_inbox_register_event = z.object({
    user_address: z.string().transform(addressTransfomer),
    timestamp: z.string().transform(transformStringToDate),
    hid: z.string().transform(v => parseInt(v)),
    public_key: z.string()
})

export const request_event = z.object({
    requester_address: z.string().transform(addressTransfomer),
    inbox_owner_address: z.string().transform(addressTransfomer),
    envelope: z.string(),
    timestamp: z.string().transform(transformStringToDate),
    inbox_name: z.string()
})

export const accept_request_event = z.object({
    requester_address: z.string().transform(addressTransfomer),
    inbox_owner_address: z.string().transform(addressTransfomer),
    timestamp: z.string().transform(transformStringToDate),
    inbox_name: z.string()
})

export const request_denied_event = z.object({
    requester_address: z.string().transform(addressTransfomer),
    inbox_owner_address: z.string().transform(addressTransfomer),
    timestamp: z.string().transform(transformStringToDate),
    inbox_name: z.string()
})

export const request_remove_from_phonebook_event = z.object({
    requester_address: z.string().transform(addressTransfomer),
    inbox_owner_address: z.string().transform(addressTransfomer),
    timestamp: z.string().transform(transformStringToDate),
    inbox_name: z.string()
})

export const delegate_register_event = z.object({
    owner: z.string().transform(addressTransfomer),
    delegate_hid: z.string(),
    user_hid: z.string(),
    delegate_address: z.string().transform(addressTransfomer),
    public_key: z.string(),
})

export const delegate_remove_event = z.object({
    delegate_address: z.string().transform(addressTransfomer),
    delegate_hid: z.string(),
    owner_address: z.string().transform(addressTransfomer),
    owner_hid: z.string()
})
