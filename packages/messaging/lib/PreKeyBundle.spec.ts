import nacl from 'tweetnacl'
import { PreKeyBundle } from "./PreKeyBundle"
import assert from 'assert'



describe('Pre Key Bundle', () => {


    it('Verify PreKeyBundle', () => {
        const identityKeyPair = nacl.sign.keyPair()
        const prekeyPair = nacl.box.keyPair()

        const signedPreKeySignature = nacl.sign(prekeyPair.publicKey, identityKeyPair.secretKey)

        const bundle = new PreKeyBundle(
            identityKeyPair.publicKey,
            prekeyPair.publicKey,
            signedPreKeySignature
        )

        assert(bundle.verify(), "Invalid Key Bundle")

    })

    it('Derive from Private key', () => {
        const identityKeyPair = nacl.sign.keyPair()
        const prekeyPair = nacl.box.keyPair()

        const bundle = PreKeyBundle.deriveFromPrivateKey({
            secretKey: identityKeyPair.secretKey,
            preKeySecret: prekeyPair.secretKey
        })

        assert(bundle.verify(), "Invalid Key Bundle")

        // check identity key
        assert(Buffer.compare(
            Buffer.from(identityKeyPair.publicKey),
            Buffer.from(bundle.identityKey)
        ) == 0, "Identity Keys Invalud")

        // check prekeys
        assert(Buffer.compare(
            Buffer.from(prekeyPair.publicKey),
            Buffer.from(bundle.signedPreKey)
        ) == 0, "Pre keys invalid")

    })

    it('Serialize Bundle', () => {
        const identityKeyPair = nacl.sign.keyPair()

        const prekeyPair = nacl.box.keyPair()

        const bundle = PreKeyBundle.deriveFromPrivateKey({
            secretKey: identityKeyPair.secretKey,
            preKeySecret: prekeyPair.secretKey
        })

        const serialized = bundle.serialize()


        assert(serialized.length == 160, 'Serialized Key Bundle Invalid')

        const reAssembledBundle = PreKeyBundle.deserialize(serialized)


        assert(Buffer.compare(
            Buffer.from(reAssembledBundle.identityKey),
            Buffer.from(identityKeyPair.publicKey)
        ) == 0, "Identity Public Keys do not Match")


    })

})