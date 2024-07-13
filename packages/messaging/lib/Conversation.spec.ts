import { expect } from "chai"
import { Branch } from "./Branch"
import { Conversation } from "./Conversation"
import { setupParticipant } from "./utils"



describe('Conversation', () => {

    it('Multiple Conversation branches', () => {
        const alice = setupParticipant()
        const bob = setupParticipant()
        const charlie = setupParticipant()
        const dave = setupParticipant()


        const aliceConversation = new Conversation(alice.bundle, alice.prekeyPair.secretKey, alice.identityKeyPair.secretKey)

        aliceConversation.addBranch(bob.bundle, 'initiator')
        const bobsBranch = new Branch(bob.prekeyPair.secretKey, alice.bundle, bob.identityKeyPair.secretKey, 'receiver')
        aliceConversation.addBranch(charlie.bundle, 'initiator')
        const charliesBranch = new Branch(charlie.prekeyPair.secretKey, alice.bundle, charlie.identityKeyPair.secretKey, 'receiver')
        aliceConversation.addBranch(dave.bundle, 'initiator')
        const daveBranch = new Branch(dave.prekeyPair.secretKey, alice.bundle, dave.identityKeyPair.secretKey, 'receiver')

        const encryptedMessages = aliceConversation.encrypt(Buffer.from('Hello World'))

        const bobsMessage = encryptedMessages.find(msg => Buffer.compare(msg.recipient, bob.bundle.identityKey) === 0)
        const charliesMessage = encryptedMessages.find(msg => Buffer.compare(msg.recipient, charlie.bundle.identityKey) === 0)
        const davesMessage = encryptedMessages.find(msg => Buffer.compare(msg.recipient, dave.bundle.identityKey) === 0)
        if (!bobsMessage || !charliesMessage || !davesMessage) {
            throw new Error("Message not found")
        }

        const decryptedMessage = bobsBranch.decrypt(bobsMessage.message.ciphertext, bobsMessage.header)
        const decryptedMessage2 = charliesBranch.decrypt(charliesMessage.message.ciphertext, charliesMessage.header)
        const decryptedMessage3 = daveBranch.decrypt(davesMessage.message.ciphertext, davesMessage.header)
        expect(decryptedMessage.plaintext.toString()).to.equal('Hello World')


        const bobsReply = Buffer.from('Hello Alice')
        const encryptedReply = bobsBranch.encrypt(bobsReply)
        const decryptedReply = aliceConversation.decrypt(encryptedReply.message.ciphertext, encryptedReply.header, bob.bundle.identityKey)

        expect(decryptedReply.plaintext.toString()).to.equal('Hello Alice')

    })

})