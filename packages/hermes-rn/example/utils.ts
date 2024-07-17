import { HermesMessaging } from "hermes-rn"
import nacl from "tweetnacl"


export const setupParticipant = () => {
    const identityKeyPair = nacl.sign.keyPair()
    const prekeyPair = nacl.box.keyPair()
    const preKeySignature = nacl.sign(prekeyPair.publicKey, identityKeyPair.secretKey)

    const bundle = new HermesMessaging.PreKeyBundle(
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