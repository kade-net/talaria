import HermesRnModule from '../HermesRnModule'
import nacl, { BoxKeyPair } from 'tweetnacl'
import { STATE } from './types'
import { Buffer } from 'buffer'
const { box } = nacl

export interface Header {
    publicKey: Buffer;       // Sender's current ratchet public key
    previousCounter: number; // Previous sending chain message counter
    counter: number;         // Current sending chain message counter
    branchId: string;
    timestamp: number // Unix timestamp of when the message key was generated
}

export interface AttachmentHeader {
    attachmentType: number;
    attachmentLength: number;
}

export function getSkippedMessageKey(state: STATE, header: Header): Buffer | null {
    const keyId = `${header.publicKey.toString('hex')}-${header.counter}`;
    if (state.MKSKIPPED[keyId]) {
        const mk = Buffer.from(state.MKSKIPPED[keyId], 'hex');
        delete state.MKSKIPPED[keyId];
        return mk;
    }
    return null;
}

// Function to parse the header
function parseHeader(buffer: Buffer): Header {
    const publicKey = buffer.slice(0, 32); // Assuming 32-byte Curve25519 public key
    const previousCounter = buffer.readUInt32BE(32);
    const counter = buffer.readUInt32BE(36);
    const timestamp = buffer.readBigInt64BE(40);
    const branchId = buffer.slice(48).toString('hex');

    return { publicKey, previousCounter, counter, branchId, timestamp: Number(timestamp) };
}

// Function to convert header to buffer
export function headerToBuffer(header: Header): Buffer {
    const previousCounterBuffer = Buffer.alloc(4);
    const counterBuffer = Buffer.alloc(4);
    const timestampBuffer = Buffer.alloc(8);
    previousCounterBuffer.writeUInt32BE(header.previousCounter, 0);
    counterBuffer.writeUInt32BE(header.counter, 0);
    timestampBuffer.writeBigInt64BE(header.timestamp, 0);
    const branchIdBuffer = Buffer.from(header.branchId, 'hex');

    return Buffer.concat([
        header.publicKey,
        previousCounterBuffer,
        counterBuffer,
        timestampBuffer,
        branchIdBuffer
    ]);
}


// The main encrypt function
export async function encrypt(plaintext: Buffer, mk: Buffer, header: Header): Promise<{ ciphertext: Buffer }> {

    const previousCounterBuffer = Buffer.alloc(4);
    const counterBuffer = Buffer.alloc(4);
    previousCounterBuffer.writeUInt32BE(header.previousCounter, 0);
    counterBuffer.writeUInt32BE(header.counter, 0);

    // Serialize header to buffer (this is a simple example, actual implementation may vary)
    const associatedData = Buffer.concat([
        header.publicKey,
        previousCounterBuffer,
        counterBuffer
    ]);

    // Perform AEAD encryption
    const ciphertext = await HermesRnModule.AEAD_Encrypt(mk.toString('hex'), plaintext.toString('hex'), associatedData.toString('hex'));

    return { ciphertext: Buffer.from(ciphertext, 'hex') };
}

// The main decrypt function
export async function decrypt(ciphertext: Buffer, mk: Buffer, headerBuffer: Buffer): Promise<{ plaintext: Buffer, valid: boolean }> {
    // Parse the header from the buffer
    const header = parseHeader(headerBuffer);

    // Serialize header to buffer (for associated data)
    const previousCounterBuffer = Buffer.alloc(4);
    const counterBuffer = Buffer.alloc(4);
    previousCounterBuffer.writeUInt32BE(header.previousCounter, 0);
    counterBuffer.writeUInt32BE(header.counter, 0);
    const associatedData = Buffer.concat([
        header.publicKey,
        previousCounterBuffer,
        counterBuffer
    ]);

    // Perform AEAD decryption
    const { plaintext, valid } = await HermesRnModule.AEAD_Decrypt(mk.toString('hex'), ciphertext.toString('hex'), associatedData.toString('hex'));

    return { plaintext: Buffer.from(plaintext, 'hex'), valid };
}

// Function to generate a new header
export function generateHeader(keypair: BoxKeyPair, previousCounter: number, counter: number, branchId?: string): Header {
    return {
        publicKey: Buffer.from(keypair.publicKey),
        previousCounter,
        counter,
        branchId: branchId ?? 'test',
        timestamp: Date.now()
    };
}

export async function get_encryption_key(state: STATE) {
    const { ckPrime, mk } = await HermesRnModule.KDF_CK(Buffer.from(state.CKs!).toString('hex'))
    state.CKs = Buffer.from(ckPrime, 'hex')
    const header = generateHeader(state.DHs!, state.PN, state.Ns, state.BRANCH_ID)

    state.Ns++

    return {
        header,
        mk: Buffer.from(mk, 'hex')
    }
}

export async function ratchet_encrypt(state: STATE, plaintext: Buffer) {
    const { ckPrime, mk } = await HermesRnModule.KDF_CK(Buffer.from(state.CKs!).toString('hex'))
    console.log("Original MK::", Buffer.from(mk, 'hex').length, mk)
    state.CKs = Buffer.from(ckPrime, 'hex')
    const header = generateHeader(state.DHs!, state.PN, state.Ns, state.BRANCH_ID)

    state.Ns++
    return {
        header,
        message: await encrypt(plaintext, Buffer.from(mk, 'hex'), header),
        mk: mk
    }
}

export async function ratchet_decrypt(state: STATE, ciphertext: Buffer, header: Header): Promise<{
    plaintext: Buffer,
    mk: Buffer
}> {
    const skippedMk = getSkippedMessageKey(state, header);
    if (skippedMk) {
        const { plaintext, valid } = await decrypt(ciphertext, skippedMk, headerToBuffer(header));
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

        const SHARED_SECRET = await HermesRnModule.DH(
            Buffer.from(state.DHs!.secretKey).toString('hex'),
            Buffer.from(state.DHs?.publicKey!).toString('hex'),
            Buffer.from(state.DHr).toString('hex')
        );

        const { rk: RK, ck: CKr } = await HermesRnModule.KDF_RK(Buffer.from(state.RK!).toString('hex'), SHARED_SECRET);
        state.RK = Buffer.from(RK, 'hex');
        state.CKr = Buffer.from(CKr, 'hex');
        state.DHs = nacl.box.keyPair(); // Generate new DH key pair for sending
        const dhOut = await HermesRnModule.DH(
            Buffer.from(state.DHs.secretKey).toString('hex'),
            Buffer.from(state.DHs.publicKey).toString('hex')
            , Buffer.from(state.DHr).toString('hex'));

        const { rk: RK2, ck: CKs } = await HermesRnModule.KDF_RK(Buffer.from(state.RK!).toString(), dhOut);
        state.RK = Buffer.from(RK2, 'hex');
        state.CKs = Buffer.from(CKs, 'hex');

    }

    while (state.Nr < header.counter) {
        const { ckPrime, mk } = await HermesRnModule.KDF_CK(Buffer.from(state.CKr!).toString('hex'));
        state.CKr = Buffer.from(ckPrime, 'hex');
        state.MKSKIPPED[`${Buffer.from(state.DHr!).toString('hex')}-${state.Nr}`] = Buffer.from(mk).toString('hex');
        state.Nr += 1;
    }

    const { ckPrime, mk } = await HermesRnModule.KDF_CK(Buffer.from(state.CKr!).toString('hex'));

    state.CKr = Buffer.from(ckPrime, 'hex');
    state.Nr += 1;


    const { plaintext, valid } = await decrypt(ciphertext, Buffer.from(mk, 'hex'), headerToBuffer(header))
    if (!valid) {
        throw new Error("Decryption failed");
    }

    return {
        plaintext,
        mk: Buffer.from(mk)
    };
}

export async function decrypt_attachment(attachment: Buffer, mk: Buffer, attachmentHeader: AttachmentHeader) {
    const attachmentTypeBuffer = Buffer.alloc(4)
    const attachmentLengthBuffer = Buffer.alloc(4)

    attachmentTypeBuffer.writeUInt32BE(attachmentHeader.attachmentType, 0)
    attachmentLengthBuffer.writeUInt32BE(attachmentHeader.attachmentLength, 0)

    const associatedData = Buffer.concat([
        attachmentTypeBuffer,
        attachmentLengthBuffer
    ])

    const { plaintext, valid } = await HermesRnModule.AEAD_Decrypt(mk.toString('hex'), attachment.toString('hex'), associatedData.toString('hex'))

    return { plaintext, valid }
}


export async function encrypt_attachment(attachment: Buffer, mk: Buffer, attachmentHeader: AttachmentHeader) {

    const attachmentTypeBuffer = Buffer.alloc(4)
    const attachmentLengthBuffer = Buffer.alloc(4)

    attachmentTypeBuffer.writeUInt32BE(attachmentHeader.attachmentType, 0)
    attachmentLengthBuffer.writeUInt32BE(attachmentHeader.attachmentLength, 0)

    const associatedData = Buffer.concat([
        attachmentTypeBuffer,
        attachmentLengthBuffer
    ])
    console.log("Aed encrypting attachment")
    const ciphertext = await HermesRnModule.AEAD_Encrypt(mk.toString('hex'), attachment.toString('hex'), associatedData.toString('hex'))
    console.log("Aed encrypted attachment")
    return { ciphertext: Buffer.from(ciphertext, 'hex') }
}