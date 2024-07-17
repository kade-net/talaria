import nacl from "tweetnacl"
import HermesRnModule from "../HermesRnModule"
import { PreKeyBundle } from "./PreKeyBundle"
import { STATE } from "./types"
import { encrypt, get_encryption_key, Header, ratchet_decrypt, ratchet_encrypt } from "./utils"
import { Buffer } from 'buffer'


export class Branch {
    currentHeader: Header | null = null
    currentMessageKey: Uint8Array | null = null
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
        MKSKIPPED: {},
        BRANCH_ID: '0000'
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

        const SHARED_SECRET = HermesRnModule.DHSync(
            Buffer.from(preKeySecret).toString('hex'),
            Buffer.from(this.localBundle.signedPreKey).toString('hex'),
            Buffer.from(remoteBundle.signedPreKey).toString('hex'))

        this.sharedSecret = Buffer.from(SHARED_SECRET, 'hex')

        this.conversationState.DHs = nacl.box.keyPair.fromSecretKey(preKeySecret)
        this.conversationState.DHr = remoteBundle.signedPreKey

        const kdfresult = HermesRnModule.KDF_RKSync(
            SHARED_SECRET,
            SHARED_SECRET
        )

        const conversationIdGen = HermesRnModule.KDF_RKSync(
            kdfresult.rk,
            SHARED_SECRET
        )

        this.conversationState.BRANCH_ID = conversationIdGen.rk

        this.conversationState.RK = Buffer.from(kdfresult.rk, 'hex')
        this.conversationState.CKs = Buffer.from(kdfresult.ck, 'hex')

        if (role === 'receiver') {
            this.conversationState.CKr = null
            this.conversationState.CKs = null
            this.conversationState.DHr = null
            this.conversationState.RK = Buffer.from(SHARED_SECRET, 'hex')
        }
    }

    async encrypt(message: Buffer, header?: Header, mk?: Buffer) {
        if (header && mk) {
            const encryptedMessage = await encrypt(message, mk, header)

            return {
                header,
                message: encryptedMessage,
                mk
            }
        }

        const encrypted = await ratchet_encrypt(this.conversationState, message)
        return encrypted
    }

    async get_encryption_key() {
        const keys = await get_encryption_key(this.conversationState)
        this.currentHeader = keys.header
        this.currentMessageKey = keys.mk
        return keys
    }

    async decrypt(ciphertext: Buffer, header: Header) {
        return ratchet_decrypt(this.conversationState, ciphertext, header)
    }

    serialize() {

        const DELIMITER = Buffer.from('split')
        const PN = Buffer.alloc(4)
        PN.writeUInt32BE(this.conversationState.PN, 0) // 1
        const Nr = Buffer.alloc(4)
        Nr.writeUInt32BE(this.conversationState.Nr, 0) // 2
        const Ns = Buffer.alloc(4)
        Ns.writeUInt32BE(this.conversationState.Ns, 0) // 3
        const CKr = this.conversationState.CKr ? Buffer.from(this.conversationState.CKr) : Buffer.from([]) // 4
        const CKs = this.conversationState.CKs ? Buffer.from(this.conversationState.CKs) : Buffer.from([]) // 5
        const RK = Buffer.from(this.conversationState.RK!) // 6
        const DHr = Buffer.from(this.conversationState.DHr!) // 7
        const REMOTE_BUNDLE = Buffer.from(this.remoteBundle.serialize()) // 8
        const BRANCH_ID = Buffer.from(this.conversationState.BRANCH_ID, 'hex')

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
            REMOTE_BUNDLE, // 8
            DELIMITER,
            BRANCH_ID // 9
        ])

        return SERIALIZED_STATE

    }

    static deserialize(serialized: Buffer, preKeySecret: Uint8Array, identityPrivateKey: Uint8Array) {

        const parts: Array<Buffer> = []

        let start = 0
        let index;

        while ((index = serialized.indexOf(Buffer.from('split'), start)) !== -1) {
            parts.push(Buffer.from(serialized.subarray(start, index)))
            start = index + Buffer.from('split').length

        }

        parts.push(Buffer.from(serialized.subarray(start)))

        const PN = parts[0]
        const Nr = parts[1]
        const Ns = parts[2]
        const CKr = parts[3]
        const CKs = parts[4]
        const RK = parts[5]
        const DHr = parts[6]
        const REMOTE_BUNDLE = parts[7]
        const CONVERSATION_ID = parts[8]


        const remoteBundle = PreKeyBundle.deserialize(Buffer.from(REMOTE_BUNDLE))

        const branch = new Branch(preKeySecret, remoteBundle, identityPrivateKey)

        branch.conversationState.PN = PN.readUInt32BE(0)
        branch.conversationState.Nr = Nr.readUInt32BE(0)
        branch.conversationState.Ns = Ns.readUInt32BE(0)
        branch.conversationState.CKr = CKr
        branch.conversationState.CKr = branch.conversationState.CKr.length > 0 ? branch.conversationState.CKr : null
        branch.conversationState.CKs = CKs
        branch.conversationState.CKs = branch.conversationState.CKs.length > 0 ? branch.conversationState.CKs : null
        branch.conversationState.RK = RK
        branch.conversationState.DHr = DHr
        branch.conversationState.BRANCH_ID = CONVERSATION_ID.toString('hex')

        return branch

    }
}