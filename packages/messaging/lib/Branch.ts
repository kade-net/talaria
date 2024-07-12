import nacl, { BoxKeyPair } from "tweetnacl";
import { PreKeyBundle } from "./PreKeyBundle";
import { DH, Header, KDF_RK } from "../utils";
import { ratchet_decrypt, ratchet_encrypt } from "..";

export interface STATE {
    /**
     * DH Ratchet key pair (the "sending" or "self" ratchet key)
     */
    DHs: BoxKeyPair | null // Not serialized
    /**
     * DH Ratchet public key (the "received" or "remote" key)
     */
    DHr: Uint8Array | null // 7
    /**
     * 32-byte Root Key
     */
    RK: Uint8Array | null // 6
    /**
     * 32-byte Chain Keys for sending chain
     */
    CKs: Uint8Array | null // 5
    /**
     * 32-byte Chain Keys for recieving chain
     */
    CKr: Uint8Array | null // 4
    /**
     * Message numbers for sending 
     */
    Ns: number // 3
    /**
     * Message numbers for receiving
     */
    Nr: number // 2 
    /**
     * Number of messages in previous sending chain
     */
    PN: number // 1
    /**
     * Dictionary of skipped-over message keys, indexed by ratchet public key and message number. Raises an exception if too many elements are stored.
     */
    MKSKIPPED: Record<string, string> // Not included in serialization
    SHARED_SECRET?: Uint8Array // Not serialized
}

export class Branch {
    private sharedSecret: Uint8Array
    localBundle: PreKeyBundle
    remoteBundle: PreKeyBundle
    conversationState: STATE = {
        CKr: null,
        CKs: null,
        DHr: null,
        RK: null,
        DHs: null,
        Ns: 0,
        Nr: 0,
        PN: 0,
        MKSKIPPED: {}
    }

    constructor(
        preKeySecret: Uint8Array,
        remoteBundle: PreKeyBundle,
        identityPrivateKey: Uint8Array,
        role: 'initiator' | 'receiver' = 'initiator'
    ) {
        this.localBundle = PreKeyBundle.deriveFromPrivateKey({
            secretKey: identityPrivateKey,
            preKeySecret
        })

        this.remoteBundle = remoteBundle

        const SHARED_SECRET = DH({
            privateKey: Buffer.from(preKeySecret),
            publicKey: Buffer.from(this.localBundle.signedPreKey)
        }, Buffer.from(remoteBundle.signedPreKey))

        this.sharedSecret = SHARED_SECRET

        this.conversationState.DHs = nacl.box.keyPair.fromSecretKey(preKeySecret)
        this.conversationState.DHr = remoteBundle.signedPreKey

        const [RK, CKs] = KDF_RK(
            Buffer.from(SHARED_SECRET),
            SHARED_SECRET
        )

        this.conversationState.RK = RK
        this.conversationState.CKs = CKs

        if (role === 'receiver') {
            this.conversationState.CKr = null
            this.conversationState.CKs = null
            this.conversationState.DHr = null
            this.conversationState.RK = SHARED_SECRET
        }
    }

    encrypt(message: Buffer) {
        const encrypted = ratchet_encrypt(this.conversationState, message)
        return encrypted
    }

    decrypt(ciphertext: Buffer, header: Header) {
        return ratchet_decrypt(this.conversationState, ciphertext, header)
    }

    serialize() {

        const DELIMITER = Buffer.from('split')
        const PN = Buffer.alloc(4)
        PN.writeUInt32BE(this.conversationState.PN) // 1
        const Nr = Buffer.alloc(4)
        Nr.writeUInt32BE(this.conversationState.Nr) // 2
        const Ns = Buffer.alloc(4)
        Ns.writeUInt32BE(this.conversationState.Ns) // 3
        const CKr = this.conversationState.CKr ? Buffer.from(this.conversationState.CKr) : Buffer.from([]) // 4
        const CKs = this.conversationState.CKs ? Buffer.from(this.conversationState.CKs) : Buffer.from([]) // 5
        const RK = Buffer.from(this.conversationState.RK!) // 6
        const DHr = Buffer.from(this.conversationState.DHr!) // 7
        const REMOTE_BUNDLE = Buffer.from(this.remoteBundle.serialize()) // 8

        const SERIALIZED_STATE = Buffer.concat([
            PN, // 1
            DELIMITER,
            Nr, // 2
            DELIMITER,
            Ns, // 3
            DELIMITER,
            CKr, // 4
            DELIMITER,
            CKs, // 5
            DELIMITER,
            RK, // 6
            DELIMITER,
            DHr, // 7
            DELIMITER,
            REMOTE_BUNDLE // 8
        ])

        return SERIALIZED_STATE

    }

    static deserialize(serialized: Buffer, preKeySecret: Uint8Array, identityPrivateKey: Uint8Array) {

        const parts: Array<Buffer> = []

        let start = 0
        let index;

        while ((index = serialized.indexOf(Buffer.from('split'), start)) !== -1) {
            parts.push(serialized.subarray(start, index))
            start = index + Buffer.from('split').length

        }

        parts.push(serialized.subarray(start))

        const PN = parts[0]
        const Nr = parts[1]
        const Ns = parts[2]
        const CKr = parts[3]
        const CKs = parts[4]
        const RK = parts[5]
        const DHr = parts[6]
        const REMOTE_BUNDLE = parts[7]


        const remoteBundle = PreKeyBundle.deserialize(Buffer.from(REMOTE_BUNDLE))

        const branch = new Branch(preKeySecret, remoteBundle, identityPrivateKey)

        branch.conversationState.PN = PN.readUInt32BE()
        branch.conversationState.Nr = Nr.readUInt32BE()
        branch.conversationState.Ns = Ns.readUInt32BE()
        branch.conversationState.CKr = CKr
        branch.conversationState.CKr = branch.conversationState.CKr.length > 0 ? branch.conversationState.CKr : null
        branch.conversationState.CKs = CKs
        branch.conversationState.CKs = branch.conversationState.CKs.length > 0 ? branch.conversationState.CKs : null
        branch.conversationState.RK = RK
        branch.conversationState.DHr = DHr

        return branch

    }
}