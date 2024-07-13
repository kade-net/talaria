import nacl from "tweetnacl"
import { PreKeyBundle } from "./PreKeyBundle"
import { Branch } from "./Branch"
import { expect } from 'chai'

const setupParticipant = () => {
    const identityKeyPair = nacl.sign.keyPair()
    const prekeyPair = nacl.box.keyPair()
    const preKeySignature = nacl.sign(prekeyPair.publicKey, identityKeyPair.secretKey)

    const bundle = new PreKeyBundle(
        identityKeyPair.publicKey,
        prekeyPair.publicKey,
        preKeySignature
    )

    return {
        identityKeyPair,
        prekeyPair,
        bundle
    }
}


describe('Branch', () => {
    it('Create Branch and encrypt and decrypt message', () => {

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

        const message = Buffer.from('Hello World')
        const encryptedMessage = aliceBranch.encrypt(message)

        const decryptedMessage = bobBranch.decrypt(encryptedMessage.message.ciphertext, encryptedMessage.header)
        expect(decryptedMessage.plaintext.toString()).to.equal('Hello World')

        const bobsReply = Buffer.from('Hello Alice')
        const encryptedReply = bobBranch.encrypt(bobsReply)

        const decryptedReply = aliceBranch.decrypt(encryptedReply.message.ciphertext, encryptedReply.header)
        expect(decryptedReply.plaintext.toString()).to.equal('Hello Alice')

        const aliceReply1 = Buffer.from('Hello Bob')
        const encryptedReply1 = aliceBranch.encrypt(aliceReply1)
        const aliceReply2 = Buffer.from('Hello Bob')
        const encryptedReply2 = aliceBranch.encrypt(aliceReply2)

        const decryptedReply1 = bobBranch.decrypt(encryptedReply2.message.ciphertext, encryptedReply2.header)
        expect(decryptedReply1.plaintext.toString()).to.equal('Hello Bob')
    })

    it('Serialize and Deserialize Branch', () => {
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

        const message = Buffer.from('Hello World')
        const encryptedMessage = aliceBranch.encrypt(message)

        const decryptedMessage = bobBranch.decrypt(encryptedMessage.message.ciphertext, encryptedMessage.header)
        expect(decryptedMessage.plaintext.toString()).to.equal('Hello World')

        const serializedAliceBranch = aliceBranch.serialize()
        const serializedBobBranch = bobBranch.serialize()

        const deserializedAliceBranch = Branch.deserialize(serializedAliceBranch, alice.prekeyPair.secretKey, alice.identityKeyPair.secretKey)
        const deserializedBobBranch = Branch.deserialize(serializedBobBranch, bob.prekeyPair.secretKey, bob.identityKeyPair.secretKey)

        expect(deserializedAliceBranch.conversationState.Ns).to.equal(deserializedBobBranch.conversationState.Nr).to.equal(1)


    })
})