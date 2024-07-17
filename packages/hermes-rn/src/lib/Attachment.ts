import { Buffer } from "buffer"
import HermesRnModule from "../HermesRnModule"

export enum AttachmentType {
    Image = 1,
    Video = 2,
    Audio = 3,
    File = 4
}

export class Attachment {
    fileUrl: string = ""
    type: AttachmentType = AttachmentType.File
    constructor(type: AttachmentType) {
        this.type = type
    }

    async encrypt(messageKey: Buffer, fileUrl: string): Promise<string> {

        const responseUrl = await HermesRnModule.EncryptFile(Buffer.from(messageKey).toString('hex'), fileUrl)

        return responseUrl
    }

    async decrypt(messageKey: Buffer, encryptedFileUrl: string) {
        const responseUrl = await HermesRnModule.DecryptFile(Buffer.from(messageKey).toString('hex'), encryptedFileUrl)

        this.fileUrl = responseUrl
        return responseUrl
    }
}