import { ApiStatusCodes, type ErrorCode, ErrorCodes } from "../../types/api.type"

class BaseError extends Error {
  public readonly name: string
  public readonly status: number
  public readonly message: string
  public readonly code: ErrorCode
  public readonly details?: any
  public readonly isOperational: boolean

  constructor(name: string, status: number, code: ErrorCode, message: string, details?: any, isOperational = true) {
    super(message)
    this.name = name
    this.status = status
    this.code = code
    this.message = message
    this.details = details
    this.isOperational = isOperational
    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this)
  }
}

export class APIError extends BaseError {
  constructor(message = "Internal server error", details?: any) {
    super("APIError", ApiStatusCodes.INTERNAL_SERVER_ERROR, ErrorCodes.INTERNAL_SERVER_ERROR, message, details, true)
  }
}

export class ValidationError extends BaseError {
  constructor(message = "Validation failed", details?: any) {
    super("ValidationError", ApiStatusCodes.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR, message, details, true)
  }
}

export class AuthorizeError extends BaseError {
  constructor(message = "Access denied", code: ErrorCode = ErrorCodes.UNAUTHORIZED, details?: any) {
    super("AuthorizeError", ApiStatusCodes.FORBIDDEN, code, message, details, true)
  }
}

export class NotFoundError extends BaseError {
  constructor(message = "Resource not found", details?: any) {
    super("NotFoundError", ApiStatusCodes.NOT_FOUND, ErrorCodes.RESOURCE_NOT_FOUND, message, details, true)
  }
}

export class ServiceUnavailableError extends BaseError {
  constructor(message = "Service unavailable", serviceName?: string) {
    let code: ErrorCode = ErrorCodes.SERVICE_UNAVAILABLE
    if (serviceName === "location") {
      code = ErrorCodes.LOCATION_SERVICE_ERROR
    }
    super("ServiceUnavailableError", ApiStatusCodes.SERVICE_UNAVAILABLE, code, message, { service: serviceName }, true)
  }
}

export class ConflictError extends BaseError {
  constructor(message = "Resource already exists", details?: any) {
    super("ConflictError", ApiStatusCodes.CONFLICT, ErrorCodes.RESOURCE_ALREADY_EXISTS, message, details, true)
  }
}

