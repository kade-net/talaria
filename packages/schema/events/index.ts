import { z } from "zod";

const transformStringToDate = (v: string) => new Date(parseInt(v) / 1000)

export const envelope = z.object({
    sender: z.string(),
    receiver: z.string(),
    content: z.string(),
    timestamp: z.string().transform(transformStringToDate),
    hid: z.string().transform(v => parseInt(v)),
    ref: z.string().optional(),
    inbox_name: z.string(),
    sender_public_key: z.string(),
    receiver_public_key: z.string()
})

export const request_inbox_register_event = z.object({
    user_address: z.string(),
    timestamp: z.string().transform(transformStringToDate),
    hid: z.string().transform(v => parseInt(v)),
    public_key: z.string()
})

export const request_event = z.object({
    requester_address: z.string(),
    inbox_owner_address: z.string(),
    envelope: z.string(),
    timestamp: z.string().transform(transformStringToDate),
    inbox_name: z.string()
})

export const accept_request_event = z.object({
    requester_address: z.string(),
    inbox_owner_address: z.string(),
    timestamp: z.string().transform(transformStringToDate),
    inbox_name: z.string()
})

export const request_denied_event = z.object({
    requester_address: z.string(),
    inbox_owner_address: z.string(),
    timestamp: z.string().transform(transformStringToDate),
    inbox_name: z.string()
})

export const request_remove_from_phonebook_event = z.object({
    requester_address: z.string(),
    inbox_owner_address: z.string(),
    timestamp: z.string().transform(transformStringToDate),
    inbox_name: z.string()
})

export const delegate_register_event = z.object({
    owner: z.string(),
    delegate_hid: z.string(),
    user_hid: z.string(),
    delegate_address: z.string()
})

export const delegate_remove_event = z.object({
    delegate_address: z.string(),
    delegate_hid: z.string(),
    owner_address: z.string(),
    owner_hid: z.string()
})
