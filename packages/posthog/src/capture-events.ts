import client from "./posthog";

export function capture_event(id: string, event: string, properties: Record<string, any>) {
    console.log(
        "Captured:: ", id, event, properties
    )
}
