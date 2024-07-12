import { Header } from "../utils";
import { Branch } from "./Branch";
import { PreKeyBundle } from "./PreKeyBundle";



export class Conversation {

    localBundle: PreKeyBundle | null = null
    preKeySecret: Uint8Array | null = null
    identityKeySecret: Uint8Array | null = null
    branches: Branch[] = []


    constructor(localBundle: PreKeyBundle, preKeySecret: Uint8Array, identityKeySecret: Uint8Array) {
        this.localBundle = localBundle
        this.preKeySecret = preKeySecret
        this.identityKeySecret = identityKeySecret
    }


    addBranch(remoteBundle: PreKeyBundle, role: 'initiator' | 'receiver') {
        const branch = new Branch(
            this.preKeySecret!,
            remoteBundle,
            this.identityKeySecret!,
            role
        )

        this.branches.push(branch)
    }

    encrypt(message: Buffer) {
        const encrypted = this.branches.map((branch) => {
            const msg = branch.encrypt(message)
            return {
                ...msg,
                recipient: branch.remoteBundle.identityKey
            }
        })

        return encrypted
    }


    decrypt(ciphertext: Buffer, header: Header, sender: Uint8Array) {
        const branch = this.branches.find(branch => Buffer.compare(branch.remoteBundle.identityKey, sender) === 0)

        if (!branch) {
            throw new Error("Branch not found")
        }

        return branch.decrypt(ciphertext, header)
    }





}