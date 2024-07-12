import nacl from 'tweetnacl'
import { assert, AssertionError } from '../utils/errors'

interface deriveFromPrivateKeyArg {
    secretKey: Uint8Array
    preKeySecret?: Uint8Array
}

/**
 * The Pre Key Bundle gets used when initializing the key chains
 */
export class PreKeyBundle {
    identityKeys: nacl.BoxKeyPair | null = null
    private currentPreKeys: nacl.BoxKeyPair | null = null

    set idKeys(value: nacl.BoxKeyPair) {
        this.identityKeys = value
    }

    set preKeys(value: nacl.BoxKeyPair) {
        this.currentPreKeys = value
    }

    identityKey: Uint8Array
    signedPreKey: Uint8Array
    signedPreKeySignature: Uint8Array

    constructor(
        identityKey: Uint8Array,
        signedPreKey: Uint8Array,
        signedPreKeySignature: Uint8Array
    ) {
        this.identityKey = identityKey
        this.signedPreKey = signedPreKey
        this.signedPreKeySignature = signedPreKeySignature
    }

    verify() {
        const verified = nacl.sign.open(this.signedPreKeySignature, this.identityKey)

        if (!verified) {
            return false
        }

        const match = Buffer.compare(Buffer.from(verified), Buffer.from(this.signedPreKey))

        return match == 0
    }

    static deriveFromPrivateKey(arg: deriveFromPrivateKeyArg) {
        const { secretKey, preKeySecret } = arg

        const originalKeyPair = nacl.sign.keyPair.fromSecretKey(secretKey)
        const preKey = preKeySecret ? nacl.box.keyPair.fromSecretKey(preKeySecret) : nacl.box.keyPair()

        let signature = nacl.sign(preKey.publicKey, originalKeyPair.secretKey)

        const bundle = new PreKeyBundle(
            originalKeyPair.publicKey,
            preKey.publicKey,
            signature
        )

        bundle.idKeys = originalKeyPair
        bundle.preKeys = preKey

        return bundle
    }

    /**
     * serialize a prekey bundle for transmission
     * @returns {string}
     */
    serialize() {


        const buff = Buffer.concat([
            Buffer.from(this.identityKey), // 32 bytes
            Buffer.from(this.signedPreKey), // 32 bytes
            Buffer.from(this.signedPreKeySignature) // 96 bytes
        ])

        return buff
    }

    /**
     * 
     * @param serializedKeyBundle - a 320 hex string
     * @returns {PreKeyBundle}
     */
    static deserialize(serializedKeyBundle: Buffer) {
        assert(serializedKeyBundle.length === 160, new AssertionError("Invalid Key Bundle"))
        const buff = serializedKeyBundle
        const identityKey = buff.subarray(0, 32)
        assert(identityKey.length == 32, new AssertionError('Identity Key too short'))
        const signedPreKey = buff.subarray(32, 64)
        assert(signedPreKey.length == 32, new AssertionError("Signed Pre Key too short"))
        const signedPreKeySignature = buff.subarray(64, 160)
        assert(signedPreKeySignature.length == 96, new AssertionError('signedPreKeySignature too short'))


        const bundle = new PreKeyBundle(
            new Uint8Array(identityKey),
            new Uint8Array(signedPreKey),
            new Uint8Array(signedPreKeySignature)
        )

        return bundle
    }


}