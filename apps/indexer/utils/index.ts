import db from 'db'

export async function getInbox(sender: string, receiver: string) {
    let v1 = `${sender}:${receiver}`
    let v2 = `${receiver}:${sender}`

    const data = await db.query.inbox.findFirst({
        where(fields, ops) {
            return ops.or(
                ops.eq(fields.id, v1),
                ops.eq(fields.id, v2)
            )
        }
    })

    return data ?? null

}