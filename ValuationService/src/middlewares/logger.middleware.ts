import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

const SENSITIVE_HEADERS = ["authorization", "x-api-key", "cookie", "set-cookie"]
const SENSITIVE_FIELDS = ["password", "token", "secret", "credit_card", "card_number", "cvv", "ssn"]

const redactSensitiveData = (obj: any, sensitiveFields: string[] = SENSITIVE_FIELDS): any => {
    if (!obj || typeof obj !== "object") return obj
    const result = Array.isArray(obj) ? [...obj] : { ...obj }
    for (const key in result) {
        if (typeof result[key] === "object" && result[key] !== null) {
        result[key] = redactSensitiveData(result[key], sensitiveFields)
        } else if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        result[key] = "[REDACTED]"
        }
    }
    return result
    }
    export const RequestResponseLogger = (req: Request, res: Response, next: NextFunction) => {
    const headers = { ...req.headers }
    for (const header of SENSITIVE_HEADERS) {
        if (headers[header]) {
        headers[header] = "[REDACTED]"
        }
    }
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`, {
        requestId: req.id,
        headers,
        query: req.query,
        body: redactSensitiveData(req.body),
    })
    const originalSend = res.send
    const originalJson = res.json
    res.send = function (body: any): Response {
        logger.info(`Outgoing response: ${req.method} ${req.originalUrl} ${res.statusCode}`, {
        requestId: req.id,
        statusCode: res.statusCode,
        responseTime: req.startTime ? `${Math.round(performance.now() - req.startTime)}ms` : undefined,
        body: typeof body === "string" && body.length < 10000 ? redactSensitiveData(body) : "[BODY TOO LARGE OR BINARY]",
        })
        return originalSend.call(this, body)
    }
    res.json = function (body: any): Response {
        logger.info(`Outgoing response: ${req.method} ${req.originalUrl} ${res.statusCode}`, {
        requestId: req.id,
        statusCode: res.statusCode,
        responseTime: req.startTime ? `${Math.round(performance.now() - req.startTime)}ms` : undefined,
        body: redactSensitiveData(body),
        })
        return originalJson.call(this, body)
    }
    next()
}

