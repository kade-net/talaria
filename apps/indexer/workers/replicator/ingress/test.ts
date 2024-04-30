import { TalariaServiceClient, credentials, events } from "@kade-net/hermes-tunnel"

const client = new TalariaServiceClient('localhost:8089', credentials.createInsecure())

function main() {
    const call = client.GetTalariaEvents(new events.EventsRequest({
        event_type: "_",
        sequence_number: 0
    }))

    call.on('data', (data: any) => {
        console.log("Data::", data.toObject())
    })

    call.on('end', () => {
        console.log("Call ended")
    })

    call.on('error', (error: any) => {
        console.log("Error::", error)
    })
}

main()
