import { decrypt_attachment, encrypt_attachment } from "../utils"

export enum AttachmentType {
    Image = 1,
    Video = 2,
    Audio = 3,
    File = 4
}

export class Attachment {
    data: Buffer
    type: AttachmentType = AttachmentType.File
    constructor(data: Buffer, type: AttachmentType) {
        this.data = data
        this.type = type
    }

    encrypt(messageKey: Buffer) {

        const encrypted = encrypt_attachment(this.data, messageKey, {
            attachmentLength: this.data.length,
            attachmentType: this.type
        })

        const attachmentTypeBuffer = Buffer.alloc(4)
        attachmentTypeBuffer.writeUInt32BE(this.type, 0)
        const attachmentLengthBuffer = Buffer.alloc(4)
        attachmentLengthBuffer.writeUInt32BE(this.data.length, 0)

        const encrypted_data = encrypted?.ciphertext ?? Buffer.alloc(0)

        const data = Buffer.concat([
            attachmentTypeBuffer,
            attachmentLengthBuffer,
            encrypted_data
        ])

        return data
    }

    static decrypt(messageKey: Buffer, ciphertext: Buffer) {
        const attachmentTypeBuffer = ciphertext.subarray(0, 4)
        const attachmentLengthBuffer = ciphertext.subarray(4, 8)
        const encryptedData = ciphertext.subarray(8)

        const attachmentType = attachmentTypeBuffer.readUInt32BE(0)
        const attachmentLength = attachmentLengthBuffer.readUInt32BE(0)

        const decrypted = decrypt_attachment(encryptedData, messageKey, {
            attachmentLength,
            attachmentType
        })

        if (!decrypted.valid) {
            throw new Error("Invalid attachment")
        }

        return new Attachment(decrypted.plaintext, attachmentType)
    }
}