import { STATE } from "../utils";

export function printState(owner: string, state: STATE, new_action?: boolean) {
    if (new_action) {
        console.log(`\n|||\n`)
    }
    console.log(`===================================START ${owner} STATE=================================`)
    const { CKr, CKs, DHr, DHs, RK, ...rest } = state
    console.log(JSON.stringify(rest))
    console.log(`===================================END   ${owner} STATE=================================\n\n`)

}