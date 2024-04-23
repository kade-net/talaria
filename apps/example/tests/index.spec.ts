import { Account } from "@aptos-labs/ts-sdk"
import { aptos, message_inbox_entry_functions, request_inbox_entry_functions } from "../constants"


describe('Create 2 inboxes, make conversation requests, send 5 messages back and forth', () => {
    it('all', async () => {
        const alice = Account.generate()
        console.log("Alice's account::", alice.accountAddress.toString())
        const bob = Account.generate()
        console.log("Bob's account::", bob.accountAddress.toString())

        await aptos.fundAccount({
            accountAddress: alice.accountAddress,
            amount: 100000000
        })

        await aptos.fundAccount({
            accountAddress: bob.accountAddress,
            amount: 100000000
        })

        const aliceCreateInboxTxn = await aptos.transaction.build.simple({
            sender: alice.accountAddress,
            data: {
                function: request_inbox_entry_functions.register_request_inbox,
                functionArguments: []
            }
        })


        await aptos.transaction.signAndSubmitTransaction({
            signer: alice,
            transaction: aliceCreateInboxTxn
        })

        const bobCreateInboxTxn = await aptos.transaction.build.simple({
            sender: bob.accountAddress,
            data: {
                function: request_inbox_entry_functions.register_request_inbox,
                functionArguments: []
            }
        })

        await aptos.transaction.signAndSubmitTransaction({
            signer: bob,
            transaction: bobCreateInboxTxn
        })


        const aliceRequestConversationTxn = await aptos.transaction.build.simple({
            sender: alice.accountAddress,
            data: {
                function: request_inbox_entry_functions.request_conversation,
                functionArguments: [bob.accountAddress, ""]
            }
        })

        await aptos.transaction.signAndSubmitTransaction({
            signer: alice,
            transaction: aliceRequestConversationTxn
        })

        const bobAcceptConversationTxn = await aptos.transaction.build.simple({
            sender: bob.accountAddress,
            data: {
                function: request_inbox_entry_functions.accept_request,
                functionArguments: [alice.accountAddress]
            }
        })

        await aptos.transaction.signAndSubmitTransaction({
            signer: bob,
            transaction: bobAcceptConversationTxn
        })

        const aliceSendMessageTxn = await aptos.transaction.build.simple({
            sender: alice.accountAddress,
            data: {
                function: message_inbox_entry_functions.send,
                functionArguments: [bob.accountAddress, "Hello Bob!", ""]
            }
        })

        await aptos.transaction.signAndSubmitTransaction({
            signer: alice,
            transaction: aliceSendMessageTxn
        })

        const bobSendMessageTxn = await aptos.transaction.build.simple({
            sender: bob.accountAddress,
            data: {
                function: message_inbox_entry_functions.send,
                functionArguments: [alice.accountAddress, "Hello Alice!", ""]
            }
        })

        await aptos.transaction.signAndSubmitTransaction({
            signer: bob,
            transaction: bobSendMessageTxn
        })

        const aliceSendMessageTxn2 = await aptos.transaction.build.simple({
            sender: alice.accountAddress,
            data: {
                function: message_inbox_entry_functions.send,
                functionArguments: [bob.accountAddress, "How are you?", ""]
            }
        })

        await aptos.transaction.signAndSubmitTransaction({
            signer: alice,
            transaction: aliceSendMessageTxn2
        })

        const bobSendMessageTxn2 = await aptos.transaction.build.simple({
            sender: bob.accountAddress,
            data: {
                function: message_inbox_entry_functions.send,
                functionArguments: [alice.accountAddress, "I'm good, you?", ""]
            }
        })

        await aptos.transaction.signAndSubmitTransaction({
            signer: bob,
            transaction: bobSendMessageTxn2
        })

        const aliceSendMessageTxn3 = await aptos.transaction.build.simple({
            sender: alice.accountAddress,
            data: {
                function: message_inbox_entry_functions.send,
                functionArguments: [bob.accountAddress, "I'm good too!", ""]
            }
        })

        await aptos.transaction.signAndSubmitTransaction({
            signer: alice,
            transaction: aliceSendMessageTxn3
        })

        const bobSendMessageTxn3 = await aptos.transaction.build.simple({
            sender: bob.accountAddress,
            data: {
                function: message_inbox_entry_functions.send,
                functionArguments: [alice.accountAddress, "Great!", ""]
            }
        })

        await aptos.transaction.signAndSubmitTransaction({
            signer: bob,
            transaction: bobSendMessageTxn3
        })

        const aliceSendMessageTxn4 = await aptos.transaction.build.simple({
            sender: alice.accountAddress,
            data: {
                function: message_inbox_entry_functions.send,
                functionArguments: [bob.accountAddress, "Bye!", ""]
            }
        })

        await aptos.transaction.signAndSubmitTransaction({
            signer: alice,
            transaction: aliceSendMessageTxn4
        })

        const bobSendMessageTxn4 = await aptos.transaction.build.simple({
            sender: bob.accountAddress,
            data: {
                function: message_inbox_entry_functions.send,
                functionArguments: [alice.accountAddress, "Bye!", ""]
            }
        })

        await aptos.transaction.signAndSubmitTransaction({
            signer: bob,
            transaction: bobSendMessageTxn4
        })





    })
})