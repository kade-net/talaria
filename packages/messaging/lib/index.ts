// 1. 2 users each with a public and private key pair which they use to generate a shared secret
import nacl, { BoxKeyPair } from 'tweetnacl'
const { box } = nacl
import { decrypt, DH, encrypt, generateHeader, getSkippedMessageKey, Header, headerToBuffer, KDF_CK, KDF_RK, STATE, uint8ArrayToHex } from '../utils'

export function get_encryption_key(state: STATE) {
    const output = KDF_CK(Buffer.from(state.CKs!))
    state.CKs = output.ckPrime
    const header = generateHeader(state.DHs!, state.PN, state.Ns)

    state.Ns++

    return {
        header,
        mk: output.mk
    }
}

export function ratchet_encrypt(state: STATE, plaintext: Buffer) {
    const output = KDF_CK(Buffer.from(state.CKs!))
    state.CKs = output.ckPrime
    const header = generateHeader(state.DHs!, state.PN, state.Ns)

    state.Ns++
    return {
        header,
        message: encrypt(plaintext, output.mk, header),
        mk: output.mk
    }
}

export function ratchet_decrypt(state: STATE, ciphertext: Buffer, header: Header): {
    plaintext: Buffer,
    mk: Buffer
} {
    const skippedMk = getSkippedMessageKey(state, header);
    if (skippedMk) {
        const { plaintext, valid } = decrypt(ciphertext, skippedMk, headerToBuffer(header));
        if (valid) {
            return {
                plaintext,
                mk: skippedMk
            }
        } else {
            throw new Error("Decryption failed with skipped message key");
        }
    }

    if (!state.DHr || Buffer.compare(Buffer.from(state.DHr), Buffer.from(header.publicKey)) !== 0) {

        state.PN = state.Ns;
        state.Ns = 0;
        state.Nr = 0;
        state.DHr = header.publicKey;

        const SHARED_SECRET = DH({
            privateKey: Buffer.from(state.DHs!.secretKey),
            publicKey: Buffer.from(state.DHs?.publicKey!)
        }, Buffer.from(state.DHr));

        [state.RK, state.CKr] = KDF_RK(Buffer.from(state.RK!), SHARED_SECRET);
        state.DHs = nacl.box.keyPair(); // Generate new DH key pair for sending
        const dhOut = DH({
            privateKey: Buffer.from(state.DHs.secretKey),
            publicKey: Buffer.from(state.DHs.publicKey)
        }, Buffer.from(state.DHr));
        [state.RK, state.CKs] = KDF_RK(Buffer.from(state.RK!), dhOut);

    }

    while (state.Nr < header.counter) {
        const { ckPrime, mk } = KDF_CK(Buffer.from(state.CKr!));
        state.CKr = ckPrime;
        state.MKSKIPPED[`${uint8ArrayToHex(state.DHr!)}-${state.Nr}`] = mk.toString('hex');
        state.Nr += 1;
    }

    const { ckPrime, mk } = KDF_CK(Buffer.from(state.CKr!));
    state.CKr = ckPrime;
    state.Nr += 1;


    const { plaintext, valid } = decrypt(ciphertext, mk, headerToBuffer(header))
    if (!valid) {
        throw new Error("Decryption failed");
    }

    return {
        plaintext,
        mk
    };
}