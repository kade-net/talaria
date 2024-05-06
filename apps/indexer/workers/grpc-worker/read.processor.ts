import protos, { aptos } from "@aptos-labs/aptos-protos";
import { LevelDB } from "lama";

const MODULE_ADDRESS = process.env.MODULE_ADDRESS!

const REQUEST_INBOX = `${MODULE_ADDRESS}::request_inbox` as const
const MESSAGE_INBOX = `${MODULE_ADDRESS}::message_inbox` as const


const SUPPORTED_EVENT_TYPES = [
    `${MESSAGE_INBOX}::Envelope`,
    `${REQUEST_INBOX}::RequestInboxRegisterEvent`,
    `${REQUEST_INBOX}::RequestEvent`,
    `${REQUEST_INBOX}::AcceptRequestEvent`,
    `${REQUEST_INBOX}::RequestDeniedEvent`,
    `${REQUEST_INBOX}::RequestRemoveFromPhoneBookEvent`,
    `${REQUEST_INBOX}::DelegateRegisterEvent`,
    `${REQUEST_INBOX}::DelegateRemoveEvent`
]

export type ProcessingResult = {
    startVersion: bigint;
    endVersion: bigint;
};

export abstract class TransactionsProcessor {

    abstract name(): string;


    abstract processTransactions({
        transactions,
        startVersion,
        endVersion,
        db
    }: {
        transactions: aptos.transaction.v1.Transaction[];
        startVersion: bigint;
        endVersion: bigint;
        db: LevelDB
    }): Promise<ProcessingResult>;

}


export class ReadProcessor extends TransactionsProcessor {
    name(): string {
        return "read_processor";
    }

    async processTransactions({
        transactions,
        startVersion,
        endVersion,
        db
    }: {
        transactions: aptos.transaction.v1.Transaction[];
        startVersion: bigint;
        endVersion: bigint;
        db: LevelDB
    }): Promise<ProcessingResult> {
        for (const transaction of transactions) {

            if (transaction.type != protos.aptos.transaction.v1.Transaction_TransactionType.TRANSACTION_TYPE_USER) {
                continue
            }

            const userTransaction = transaction.user!;


            const hex_signature = userTransaction.request?.signature?.ed25519?.signature ?
                Buffer.from(userTransaction.request?.signature?.ed25519?.signature!).toString('hex') : ''

            if (!userTransaction.events) {
                continue
            }

            const _publicKey = userTransaction.request?.signature?.ed25519?.publicKey!// All transactions are signed with ed25519
            const publicKey = Buffer.from(_publicKey).toString('hex')

            const events = userTransaction.events!;

            for (const event of events) {
                const eventType = event.typeStr;
                if (eventType && SUPPORTED_EVENT_TYPES.includes(eventType)) {
                    console.log("Processing event", eventType)
                    await db.put({
                        type: eventType?.split("::")?.at(2),
                        event: event.data,
                        signature: hex_signature,
                        publicKey
                    })
                }
            }

        }
        return {
            startVersion,
            endVersion
        };
    }
}