import { expect } from "chai"
import { Branch } from "./Branch"
import { Conversation } from "./Conversation"
import { Message, MessageType } from "./Message"
import { setupParticipant } from "./utils"

const alice = setupParticipant()
const bob = setupParticipant()
const charlie = setupParticipant()
const dave = setupParticipant()
const eve = setupParticipant()


describe('Messaging General Test', () => {

    it('Send and receive message', () => {

        const aliceConversation = new Conversation(alice.bundle, alice.prekeyPair.secretKey, alice.identityKeyPair.secretKey)

        aliceConversation.addBranch(bob.bundle, 'initiator')
        const bobsBranch = new Branch(bob.prekeyPair.secretKey, alice.bundle, bob.identityKeyPair.secretKey, 'receiver')
        aliceConversation.addBranch(charlie.bundle, 'initiator')
        const charliesBranch = new Branch(charlie.prekeyPair.secretKey, alice.bundle, charlie.identityKeyPair.secretKey, 'receiver')
        aliceConversation.addBranch(dave.bundle, 'initiator')
        const daveBranch = new Branch(dave.prekeyPair.secretKey, alice.bundle, dave.identityKeyPair.secretKey, 'receiver')
        aliceConversation.addBranch(eve.bundle, 'initiator')
        const eveBranch = new Branch(eve.prekeyPair.secretKey, alice.bundle, eve.identityKeyPair.secretKey, 'receiver')

        const message = new Message(
            "Hello World",
            MessageType.MESSAGE
        ).serialize()

        const encryptedMessages = aliceConversation.encrypt(message)

        const charliesMessage = encryptedMessages.find(msg => Buffer.compare(msg.recipient, charlie.bundle.identityKey) === 0)

        if (!charliesMessage) {
            throw new Error("Message not found")
        }

        const decryptedMessage = charliesBranch.decrypt(charliesMessage.message.ciphertext, charliesMessage.header)

        expect(Message.deserialize(decryptedMessage.plaintext).content).to.equal('Hello World')

        const charliesReply = new Message("Hello Alice", MessageType.MESSAGE).serialize()

        const encryptedReply = charliesBranch.encrypt(charliesReply)

        const decryptedReply = aliceConversation.decrypt(encryptedReply.message.ciphertext, encryptedReply.header, charlie.bundle.identityKey)

        expect(Message.deserialize(decryptedReply.plaintext).content).to.equal('Hello Alice')


    })

})