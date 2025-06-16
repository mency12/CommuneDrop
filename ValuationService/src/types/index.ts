// Remove the global declaration and create a custom interface instead
import type { Request } from "express"
export * from "./valuation.type"

export interface AuthenticatedRequest extends Request {
    user?: {
        clientId: string
        scopes: string[]
    }
}

