import { TalariaServiceClient, credentials, events } from "@kade-net/hermes-tunnel"

const client = new TalariaServiceClient('monorail.proxy.rlwy.net:24651', credentials.createInsecure())

function main() {
    const call = client.GetTalariaEvents(new events.EventsRequest({
        event_type: "Envelope",
        sequence_number: 0
    }))

    call.on('data', (data: events.EventsRequest) => {
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
