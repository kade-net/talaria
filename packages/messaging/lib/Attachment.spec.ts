import { expect } from "chai"
import { Attachment, AttachmentType } from "./Attachment"
import { Branch } from "./Branch"
import { setupParticipant } from "./utils"
import fs from 'fs'




describe('Encrypt and decrypt attachment', () => {

    it('Image', () => {
        const alice = setupParticipant()
        const bob = setupParticipant()

        const branch = new Branch(
            alice.prekeyPair.secretKey,
            bob.bundle,
            alice.identityKeyPair.secretKey
        )

        const blob = fs.readFileSync('./lib/Attachments.test/image.jpg', {
        })

        console.log("File Length ::", blob.length)

        const attachment = new Attachment(blob, AttachmentType.Image)


        const encryptionKeys = branch.get_encryption_key()

        const encryptedAttachment = attachment.encrypt(encryptionKeys.mk)

        const decryptedAttachment = Attachment.decrypt(encryptionKeys.mk, encryptedAttachment)

        expect(decryptedAttachment.data.toString()).to.equal(blob.toString())

        expect(decryptedAttachment.type).to.equal(AttachmentType.Image)


        // write the decrypted attachment to a file
        fs.writeFileSync('./lib/Attachments.test/image_decrypted.jpg', decryptedAttachment.data)

    })


    it('Video', () => {
        const alice = setupParticipant()
        const bob = setupParticipant()

        const branch = new Branch(
            alice.prekeyPair.secretKey,
            bob.bundle,
            alice.identityKeyPair.secretKey
        )

        const blob = fs.readFileSync('./lib/Attachments.test/video.mp4', {
        })

        const attachment = new Attachment(blob, AttachmentType.Video)

        const encryptionKeys = branch.get_encryption_key()

        const encryptedAttachment = attachment.encrypt(encryptionKeys.mk)

        const decryptedAttachment = Attachment.decrypt(encryptionKeys.mk, encryptedAttachment)

        expect(decryptedAttachment.data.toString()).to.equal(blob.toString())

        expect(decryptedAttachment.type).to.equal(AttachmentType.Video)

        // write the decrypted attachment to a file

        fs.writeFileSync('./lib/Attachments.test/video_decrypted.mp4', decryptedAttachment.data)

    })

    after(() => {
        fs.rm('./lib/Attachments.test/image_decrypted.jpg', (err) => {
            if (err) {
                console.log(err)
            }
        })

        fs.rm('./lib/Attachments.test/video_decrypted.mp4', (err) => {
            if (err) {
                console.log(err)
            }
        })
    })
})