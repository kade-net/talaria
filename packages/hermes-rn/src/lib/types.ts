import { BoxKeyPair } from "tweetnacl"

export interface STATE {
    /**
     * DH Ratchet key pair (the "sending" or "self" ratchet key)
     */
    DHs: BoxKeyPair | null
    /**
     * DH Ratchet public key (the "received" or "remote" key)
     */
    DHr: Uint8Array | null
    /**
     * 32-byte Root Key
     */
    RK: Uint8Array | null
    /**
     * 32-byte Chain Keys for sending chain
     */
    CKs: Uint8Array | null
    /**
     * 32-byte Chain Keys for recieving chain
     */
    CKr: Uint8Array | null
    /**
     * Message numbers for sending 
     */
    Ns: number
    /**
     * Message numbers for receiving
     */
    Nr: number
    /**
     * Number of messages in previous sending chain
     */
    PN: number
    /**
     * Dictionary of skipped-over message keys, indexed by ratchet public key and message number. Raises an exception if too many elements are stored.
     */
    MKSKIPPED: Record<string, string>
    /**
     * A randomly generated key that is used to uniquely identify which conversation this state belongs to
     */
    BRANCH_ID: string
}