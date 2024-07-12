
export class AssertionError extends Error { }

export function assert(success: boolean, error: AssertionError) {
    if (!success) throw error
}