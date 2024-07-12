import nacl from 'tweetnacl'
const { box } = nacl
import { DH, KDF_RK, STATE } from '../utils'
import { ratchet_decrypt, ratchet_encrypt } from '..'
import { printState } from './test-utils'

const alice = box.keyPair()

const ALICE_STATE: STATE = {
    CKr: null,
    CKs: null,
    DHr: null,
    DHs: null,
    RK: null,
    Nr: 0,
    Ns: 0,
    PN: 0,
    MKSKIPPED: {}
}

const bob = box.keyPair()

const BOB_STATE: STATE = {
    CKr: null,
    CKs: null,
    DHr: null,
    DHs: null,
    RK: null,
    Nr: 0,
    Ns: 0,
    PN: 0,
    MKSKIPPED: {}
}

const SHARED_SECRET = box.before(alice.publicKey, bob.secretKey)
//---------------------------------------

//2. Initialize the chains of these users, who ever's sending the first message initializes first, lets say bob goes first
// BOB
function initialize_bob() {
    BOB_STATE.DHs = box.keyPair()
    BOB_STATE.DHr = null
    BOB_STATE.RK = SHARED_SECRET
    BOB_STATE.CKs = null
    BOB_STATE.CKr = null
    BOB_STATE.Ns = 0
    BOB_STATE.Nr = 0
    BOB_STATE.PN = 0
    BOB_STATE.MKSKIPPED = {}
}

initialize_bob()

// ALICE
export function initialize_alice() {
    ALICE_STATE.DHs = box.keyPair()
    ALICE_STATE.DHr = BOB_STATE.DHs!.publicKey
    const [RK, CKs] = KDF_RK(Buffer.from(SHARED_SECRET), DH({
        privateKey: Buffer.from(ALICE_STATE.DHs.secretKey),
        publicKey: Buffer.from(ALICE_STATE.DHs.publicKey)
    }, Buffer.from(ALICE_STATE.DHr)))
    ALICE_STATE.RK = RK
    ALICE_STATE.CKs = CKs
    ALICE_STATE.CKr = null
    ALICE_STATE.Nr = 0
    ALICE_STATE.Ns = 0
    ALICE_STATE.PN = 0
    ALICE_STATE.MKSKIPPED = {}
}

initialize_alice()

describe('Encrypt and Decrypt Message', () => {

    it("Base test", () => {
        ratchet_encrypt(ALICE_STATE, Buffer.from("Hello BOB"))

        const output = ratchet_encrypt(ALICE_STATE, Buffer.from("Howdy BOB"))

        const decrypted = ratchet_decrypt(BOB_STATE, output.message.ciphertext, output.header)

        ratchet_encrypt(BOB_STATE, Buffer.from("Hello ALICE"))

        const output2 = ratchet_encrypt(BOB_STATE, Buffer.from("Howdy ALICE"))

        const decrypted2 = ratchet_decrypt(ALICE_STATE, output2.message.ciphertext, output2.header)

        const output3 = ratchet_encrypt(ALICE_STATE, Buffer.from("Howdy BOB 3"))

        const decrypted3 = ratchet_decrypt(BOB_STATE, output3.message.ciphertext, output3.header)

    })

})