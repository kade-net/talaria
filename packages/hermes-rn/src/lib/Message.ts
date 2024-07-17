import { Buffer } from "buffer"

const MESSAGE_DELIMITER = Buffer.from('message_delimiter')
const ATTACHMENT_DELIMITER = Buffer.from('attachment_delimiter')
const ATTACHMENT_OPTION_DELIMITER = Buffer.from('attachment_option_delimiter')
export enum MessageType {
    MESSAGE = 1,
    REPLY = 2,
    REACTION = 3,
    DELETION = 4,
    UPDATE = 5,
    TRANSACTION_REQUEST = 6,
    TRANSACTION_RESPONSE = 7
}

export enum MessageAttachmentType {
    IMAGE = 1,
    VIDEO = 2,
    AUDIO = 3,
    PORTAL = 4,
}

export interface MessageAttachment {
    type: MessageAttachmentType
    storageUri: string
}

export class Message {
    content: string = ''
    type: MessageType = MessageType.MESSAGE
    attachments: MessageAttachment[] = []

    constructor(content: string, type: MessageType = MessageType.MESSAGE) {
        this.content = content
        this.type = type
    }

    updateContent(content: string) {
        this.content = content
    }

    serialize() {

        const CONTENT = Buffer.from(this.content, 'utf-8')
        const TYPE = Buffer.alloc(4)
        TYPE.writeUInt32BE(this.type, 0)
        const ATTACHMENTS = Buffer.concat(this.attachments.map(att => {
            const TYPE = Buffer.alloc(4)
            TYPE.writeUInt32BE(att.type, 0)
            const STORAGE_URI = Buffer.from(att.storageUri)
            return Buffer.concat([TYPE, ATTACHMENT_DELIMITER, STORAGE_URI])
        }))
        const SERIALIZED_MESSAGE = Buffer.concat([
            CONTENT,
            MESSAGE_DELIMITER,
            TYPE,
            MESSAGE_DELIMITER,
            ATTACHMENTS
        ])

        return SERIALIZED_MESSAGE
    }

    static deserialize(serialized: Buffer) {

        const parts: Array<Buffer> = []

        let start = 0
        let index;

        while ((index = serialized.indexOf(MESSAGE_DELIMITER, start)) !== -1) {
            parts.push(Buffer.from(serialized.subarray(start, index)))
            start = index + MESSAGE_DELIMITER.length

        }

        parts.push(Buffer.from(serialized.subarray(start)))

        const CONTENT = parts[0].toString('utf-8')
        const TYPE = parts[1].readUInt32BE(0)
        const ATTACHMENTS = parts[2]

        if (ATTACHMENTS.length === 0) {
            return new Message(CONTENT, TYPE)
        }

        let attachmentParts: Array<Buffer> = []
        let attachmentStart = 0
        let attachmentIndex;

        while ((attachmentIndex = ATTACHMENTS.indexOf(ATTACHMENT_DELIMITER, attachmentStart)) !== -1) {
            attachmentParts.push(Buffer.from(ATTACHMENTS.subarray(attachmentStart, attachmentIndex)))
            console.log("Attachment parts: ", attachmentParts)
            attachmentStart = attachmentIndex + ATTACHMENT_DELIMITER.length

        }

        attachmentParts.push(Buffer.from(ATTACHMENTS.subarray(attachmentStart)))

        const attachments: MessageAttachment[] = attachmentParts.map(part => {
            const parts: Array<Buffer> = []
            let start = 0
            let index;

            while ((index = part.indexOf(ATTACHMENT_OPTION_DELIMITER, start)) !== -1) {
                parts.push(Buffer.from(part.subarray(start, index)))
                start = index + ATTACHMENT_OPTION_DELIMITER.length

            }

            parts.push(Buffer.from(part.subarray(start)))

            const TYPE = parts[0].readUInt32BE(0)
            const STORAGE_URI = parts[1].toString('utf-8')

            return {
                type: TYPE,
                storageUri: STORAGE_URI
            }
        })

        const message = new Message(CONTENT, TYPE)
        message.attachments = attachments

        return message

    }

}