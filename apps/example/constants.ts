import 'dotenv/config'
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { Network } from "aptos";

export const aptosConfig = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(aptosConfig);

const MODULE_ADDRESS = process.env.MODULE_ADDRESS as string
const REQUEST_INBOX = `${MODULE_ADDRESS}::request_inbox` as const
const MESSAGE_INBOX = `${MODULE_ADDRESS}::message_inbox` as const


export const request_inbox_entry_functions = {
    accept_request: `${REQUEST_INBOX}::accept_request` as const,
    create_delegate_link_intent: `${REQUEST_INBOX}::create_delegate_link_intent` as const,
    delegate_accept_request: `${REQUEST_INBOX}::delegate_accept_request` as const,
    delegate_deny_request: `${REQUEST_INBOX}::delegate_deny_request` as const,
    delegate_remove_from_phonebook: `${REQUEST_INBOX}::delegate_remove_from_phonebook` as const,
    delegate_request_conversation: `${REQUEST_INBOX}::delegate_request_conversation` as const,
    deny_request: `${REQUEST_INBOX}::deny_request` as const,
    register_delegate: `${REQUEST_INBOX}::register_delegate` as const,
    register_request_inbox: `${REQUEST_INBOX}::register_request_inbox` as const,
    remove_delegate: `${REQUEST_INBOX}::remove_delegate` as const,
    remove_from_phonebook: `${REQUEST_INBOX}::remove_from_phonebook` as const,
    request_conversation: `${REQUEST_INBOX}::request_conversation` as const,
}

export const message_inbox_entry_functions = {
    send: `${MESSAGE_INBOX}::send` as const,
}