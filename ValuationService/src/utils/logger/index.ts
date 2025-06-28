import crypto from "crypto"
import { pinoHttp } from "pino-http"
import pino from "pino"
import { config } from "../../config"

const logLevel = config.app.env === "production" ? "info" : "debug"

// Define log redaction patterns
const redactionPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  'req.headers["x-api-key"]',
  "req.body.password",
  "req.body.token",
  "req.body.secret",
  "req.body.credit_card",
  "req.body.card_number",
  'res.headers["set-cookie"]',
]

export const logger = pino({
  level: logLevel,
  base: {
    serviceName: "valuation-service",
    environment: config.app.env,
  },
  redact: {
    paths: redactionPaths,
    censor: "[REDACTED]",
  },
  serializers: {
    ...pino.stdSerializers,
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
      headers: req.headers,
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.headers,
    }),
    err: (err) => ({
      type: err.constructor.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode,
    }),
  },
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: config.app.env !== "production",
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
})

// Create a child logger with correlation ID
export const createContextLogger = (correlationId: string) => {
  return logger.child({ correlationId })
}

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers["x-request-id"] || req.headers["x-correlation-id"] || crypto.randomUUID(),
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return "error"
    if (res.statusCode >= 400) return "warn"
    return "info"
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed with ${res.statusCode}`
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed with ${res.statusCode}: ${err?.message}`
  },  autoLogging: {
    ignore: (req) => req.url === "/health",
  },
})

