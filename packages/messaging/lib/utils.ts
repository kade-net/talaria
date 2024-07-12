import nacl from "tweetnacl"
import { PreKeyBundle } from "./PreKeyBundle"

export const setupParticipant = () => {
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