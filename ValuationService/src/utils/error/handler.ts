import type { Request, Response, NextFunction } from "express"
import { AuthorizeError, NotFoundError, ValidationError, APIError, ServiceUnavailableError } from "./errors"
import { logger } from "../logger"
import axios from "axios"
import { type ApiResponse, ApiStatusCodes, type ErrorCode, ErrorCodes } from "../../types/api.type"
import { performance } from "perf_hooks"

declare global {
  namespace Express {
    interface Request {
      startTime?: number
    }
  }
}

export const RequestTimingMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  req.startTime = performance.now()
  next()
}

export const HandleErrorWithLogger = (error: Error, req: Request, res: Response, _next: NextFunction): void => {
  let reportError = true
  let status = ApiStatusCodes.INTERNAL_SERVER_ERROR
  let message = error.message || "Internal server error"
  let code: ErrorCode = ErrorCodes.INTERNAL_SERVER_ERROR
  let details: any = undefined
  const duration = req.startTime ? Math.round(performance.now() - req.startTime) : undefined
  if (error instanceof NotFoundError) {
    reportError = false
    status = error.status
    message = error.message
    code = error.code
    details = error.details
  } else if (error instanceof ValidationError) {
    reportError = false
    status = error.status
    message = error.message
    code = error.code
    details = error.details
  } else if (error instanceof AuthorizeError) {
    reportError = false
    status = error.status
    message = error.message
    code = error.code
    details = error.details
  } else if (error instanceof ServiceUnavailableError) {
    status = error.status
    message = error.message
    code = error.code
    details = error.details
  } else if (error instanceof APIError) {
    status = error.status
    message = error.message
    code = error.code
    details = error.details
  } else if (axios.isAxiosError(error)) {
    status = error.response?.status || ApiStatusCodes.BAD_GATEWAY
    message = error.response?.data?.error || error.message
    code = ErrorCodes.EXTERNAL_SERVICE_ERROR
    details = {
      service: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      response: error.response?.data,
    }
  }
  const logData = {
    error: error.stack,
    requestId: req.id,
    method: req.method,
    path: req.path,
    status,
    code,
    duration,
    details: details ? JSON.stringify(details) : undefined,
  }
  if (reportError) {
    logger.error(`${req.method} ${req.path} - ${status} - ${code}: ${message}`, logData)
  } else if (status >= 500) {
    logger.warn(`${req.method} ${req.path} - ${status} - ${code}: ${message}`, logData)
  } else {
    logger.info(`${req.method} ${req.path} - ${status} - ${code}: ${message}`, logData)
  }
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      requestId: req.id as string,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      duration,
    },
  }
  res.status(status).json(response)
}

