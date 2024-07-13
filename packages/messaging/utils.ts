import crypto from 'crypto'
import nacl, { BoxKeyPair } from 'tweetnacl';


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
}

function hkdfExtract(salt: Buffer, ikm: Buffer, hashAlgo: string): Buffer {
    return crypto.createHmac(hashAlgo, salt).update(ikm).digest();
}

/**
 * HKDF Expand
 * @param prk - Pseudorandom key
 * @param info - Optional context and application specific information
 * @param length - Length of output keying material in bytes
 * @param hashAlgo - Hash algorithm to use (e.g., 'sha256')
 * @returns - Output keying material
 */
function hkdfExpand(prk: Buffer, info: Buffer, length: number, hashAlgo: string): Buffer {
    const hashLen = crypto.createHash(hashAlgo).digest().length;
    const n = Math.ceil(length / hashLen);
    let okm = Buffer.alloc(0);
    let outputBlock = Buffer.alloc(0);

    for (let i = 1; i <= n; i++) {
        const buffer = Buffer.concat([outputBlock, info, Buffer.from([i])]);
        outputBlock = crypto.createHmac(hashAlgo, prk).update(buffer).digest();
        okm = Buffer.concat([okm, outputBlock]);
    }

    return okm.slice(0, length);
}

export function KDF_RK(rk: Buffer, dhOut: Buffer): [Buffer, Buffer] {
    const hashAlgo: string = 'sha256'
    const info = Buffer.from("hermes:protocol")
    const prk = hkdfExtract(rk, dhOut, hashAlgo);
    const output = hkdfExpand(prk, info, 64, hashAlgo);

    return [
        output.subarray(0, 32),
        output.subarray(32, 64)
    ]
}


export function DH(dhPair: { privateKey: Buffer, publicKey: Buffer }, dhPub: Buffer): Buffer {
    const sharedSecret = nacl.scalarMult(dhPair.privateKey, dhPub);
    return Buffer.from(sharedSecret);
}


/**
 * Key Derivation Function for the Chain Key (KDF_CK)
 * @param ck - Current Chain Key
 * @returns - An object containing the new Chain Key (CK') and the Message Key (MK)
 */
export function KDF_CK(ck: Buffer): { ckPrime: Buffer, mk: Buffer } {
    // Define the constant for the HMAC
    const constant = Buffer.from('01', 'hex');

    // Perform HMAC with CK as the key and the constant as the message
    const hmac = crypto.createHmac('sha256', ck);
    hmac.update(constant);
    const prk = hmac.digest();

    // Use HKDF-Expand to generate CK' and MK
    const info1 = Buffer.from('chain key expansion', 'utf-8');
    const info2 = Buffer.from('message key expansion', 'utf-8');

    const ckPrime = hkdfExpand(prk, info1, 32, 'sha256');
    const mk = hkdfExpand(prk, info2, 32, 'sha256');

    return { ckPrime, mk };
}


export interface Header {
    publicKey: Buffer;       // Sender's current ratchet public key
    previousCounter: number; // Previous sending chain message counter
    counter: number;         // Current sending chain message counter
}

export interface AttachmentHeader {
    attachmentType: number;
    attachmentLength: number;
}

// Function to generate a new header
export function generateHeader(keypair: BoxKeyPair, previousCounter: number, counter: number): Header {
    return {
        publicKey: Buffer.from(keypair.publicKey),
        previousCounter,
        counter
    };
}


// Helper function to perform AEAD encryption
function AEAD_Encrypt(key: Buffer, plaintext: Buffer, associatedData: Buffer): { ciphertext: Buffer } {
    const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    cipher.setAAD(associatedData);

    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();

    return { ciphertext: Buffer.concat([iv, ciphertext, tag]) };
}

export function encrypt_attachment(attachment: Buffer, mk: Buffer, attachmentHeader: AttachmentHeader) {

    const attachmentTypeBuffer = Buffer.alloc(4)
    const attachmentLengthBuffer = Buffer.alloc(4)

    attachmentTypeBuffer.writeUInt32BE(attachmentHeader.attachmentType, 0)
    attachmentLengthBuffer.writeUInt32BE(attachmentHeader.attachmentLength, 0)

    const associatedData = Buffer.concat([
        attachmentTypeBuffer,
        attachmentLengthBuffer
    ])

    const { ciphertext } = AEAD_Encrypt(mk, attachment, associatedData)

    return { ciphertext }
}

// The main encrypt function
export function encrypt(plaintext: Buffer, mk: Buffer, header: Header): { ciphertext: Buffer } {

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
    const { ciphertext } = AEAD_Encrypt(mk, plaintext, associatedData);

    return { ciphertext };
}


// Helper function to perform AEAD decryption
function AEAD_Decrypt(key: Buffer, encryptedMessage: Buffer, associatedData: Buffer): { plaintext: Buffer, valid: boolean } {
    const iv = encryptedMessage.subarray(0, 12); // Extract the 96-bit IV
    const tag = encryptedMessage.subarray(-16); // Extract the 16-byte authentication tag
    const ciphertext = encryptedMessage.subarray(12, -16); // Extract the ciphertext

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(associatedData);
    decipher.setAuthTag(tag);

    try {
        const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return { plaintext, valid: true };
    } catch (err) {
        console.log("Decryption failed", err)
        return { plaintext: Buffer.alloc(0), valid: false };
    }
}


export function decrypt_attachment(attachment: Buffer, mk: Buffer, attachmentHeader: AttachmentHeader) {
    const attachmentTypeBuffer = Buffer.alloc(4)
    const attachmentLengthBuffer = Buffer.alloc(4)

    attachmentTypeBuffer.writeUInt32BE(attachmentHeader.attachmentType, 0)
    attachmentLengthBuffer.writeUInt32BE(attachmentHeader.attachmentLength, 0)

    const associatedData = Buffer.concat([
        attachmentTypeBuffer,
        attachmentLengthBuffer
    ])

    const { plaintext, valid } = AEAD_Decrypt(mk, attachment, associatedData)

    return { plaintext, valid }
}

// Function to parse the header
function parseHeader(buffer: Buffer): Header {
    const publicKey = buffer.slice(0, 32); // Assuming 32-byte Curve25519 public key
    const previousCounter = buffer.readUInt32BE(32);
    const counter = buffer.readUInt32BE(36);

    return { publicKey, previousCounter, counter };
}

// The main decrypt function
export function decrypt(ciphertext: Buffer, mk: Buffer, headerBuffer: Buffer): { plaintext: Buffer, valid: boolean } {
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
    const { plaintext, valid } = AEAD_Decrypt(mk, ciphertext, associatedData);

    return { plaintext, valid };
}


// Function to convert Uint8Array to Hex string
export function uint8ArrayToHex(array: Uint8Array): string {
    return Buffer.from(array).toString('hex');
}


// Function to handle skipped message keys
export function getSkippedMessageKey(state: STATE, header: Header): Buffer | null {
    const keyId = `${uint8ArrayToHex(header.publicKey)}-${header.counter}`;
    if (state.MKSKIPPED[keyId]) {
        const mk = Buffer.from(state.MKSKIPPED[keyId], 'hex');
        delete state.MKSKIPPED[keyId];
        return mk;
    }
    return null;
}


// Function to convert header to buffer
export function headerToBuffer(header: Header): Buffer {
    const previousCounterBuffer = Buffer.alloc(4);
    const counterBuffer = Buffer.alloc(4);
    previousCounterBuffer.writeUInt32BE(header.previousCounter, 0);
    counterBuffer.writeUInt32BE(header.counter, 0);

    return Buffer.concat([
        header.publicKey,
        previousCounterBuffer,
        counterBuffer
    ]);
}