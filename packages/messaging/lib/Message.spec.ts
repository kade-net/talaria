import { expect } from "chai"
import { Message } from "./Message"
import { setupParticipant } from "./utils"
import { Branch } from "./Branch"



describe('Message', () => {

    it('Create, serialize and deserialize message', () => {
        const message = new Message('Hello World')
        const serialized = message.serialize()
        const deserialized = Message.deserialize(serialized)
        expect(deserialized.content).to.equal('Hello World')


    })

    it('Send messages ', () => {
        const alice = setupParticipant()
        const bob = setupParticipant()

        const aliceBranch = new Branch(
            alice.prekeyPair.secretKey,
            bob.bundle,
            alice.identityKeyPair.secretKey
        )

        const bobBranch = new Branch(
            bob.prekeyPair.secretKey,
            alice.bundle,
            bob.identityKeyPair.secretKey,
            'receiver'
        )

        const message = new Message('Hello World').serialize()

        const encryptedMessage = aliceBranch.encrypt(message)
        const decryptedMessage = bobBranch.decrypt(encryptedMessage.message.ciphertext, encryptedMessage.header)

        const deserializedMessage = Message.deserialize(decryptedMessage)

        expect(deserializedMessage.content).to.equal('Hello World')


    })


})