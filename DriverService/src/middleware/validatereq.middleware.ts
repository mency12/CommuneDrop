import type { Request, Response, NextFunction } from "express"
import { ValidationError } from "../utils/error"
import { logger } from "../utils/logger"

type ValidationRule = {
  type?: "string" | "number" | "boolean" | "object" | "array"
  required?: boolean
}

type ValidationSchema = {
  headers?: string[] | Record<string, ValidationRule>
  params?: string[] | Record<string, ValidationRule>
  query?: Record<string, ValidationRule>
  body?: Record<string, ValidationRule>
}

/**
 * Middleware to validate request parameters, headers, query, and body
 * @param schema Validation schema defining required fields and their types
 */
export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: string[] = []

      // Validate headers
      if (schema.headers) {
        if (Array.isArray(schema.headers)) {
          // If headers is an array of strings, check if they exist
          schema.headers.forEach((header) => {
            if (!req.headers[header.toLowerCase()]) {
              errors.push(`Header '${header}' is required`)
            }
          })
        } else {
          // If headers is an object with rules, validate according to rules
          Object.entries(schema.headers).forEach(([header, rule]) => {
            const headerValue = req.headers[header.toLowerCase()]
            if (rule.required && !headerValue) {
              errors.push(`Header '${header}' is required`)
            } else if (headerValue && rule.type) {
              validateType(headerValue.toString(), rule.type, `Header '${header}'`, errors)
            }
          })
        }
      }

      // Validate URL parameters
      if (schema.params) {
        if (Array.isArray(schema.params)) {
          // If params is an array of strings, check if they exist
          schema.params.forEach((param) => {
            if (!req.params[param]) {
              errors.push(`Parameter '${param}' is required`)
            }
          })
        } else {
          // If params is an object with rules, validate according to rules
          Object.entries(schema.params).forEach(([param, rule]) => {
            if (rule.required && !req.params[param]) {
              errors.push(`Parameter '${param}' is required`)
            } else if (req.params[param] && rule.type) {
              validateType(req.params[param], rule.type, `Parameter '${param}'`, errors)
            }
          })
        }
      }

      // Validate query parameters
      if (schema.query) {
        Object.entries(schema.query).forEach(([queryParam, rule]) => {
          const queryValue = req.query[queryParam]
          if (rule.required && queryValue === undefined) {
            errors.push(`Query parameter '${queryParam}' is required`)
          } else if (queryValue !== undefined && rule.type) {
            validateType(queryValue.toString(), rule.type, `Query parameter '${queryParam}'`, errors)
          }
        })
      }

      // Validate body
      if (schema.body) {
        Object.entries(schema.body).forEach(([field, rule]) => {
          if (rule.required && (req.body[field] === undefined || req.body[field] === null)) {
            errors.push(`Body field '${field}' is required`)
          } else if (req.body[field] !== undefined && req.body[field] !== null && rule.type) {
            validateType(req.body[field], rule.type, `Body field '${field}'`, errors)
          }
        })
      }

      // If there are validation errors, throw a ValidationError
      if (errors.length > 0) {
        logger.warn(`Request validation failed: ${errors.join(", ")}`)
        throw new ValidationError(errors.join(", "))
      }

      // If validation passes, proceed to the next middleware
      next()
    } catch (error) {
      logger.error("Validation error", error)
      if (error instanceof ValidationError) {
        next(error)
      } else {
        next(new ValidationError("Request validation failed"))
      }
    }
  }
}

/**
 * Helper function to validate a value against a type
 */
function validateType(value: any, type: string, fieldName: string, errors: string[]) {
  switch (type) {
    case "string":
      if (typeof value !== "string") {
        errors.push(`${fieldName} must be a string`)
      }
      break
    case "number":
      const num = Number(value)
      if (isNaN(num)) {
        errors.push(`${fieldName} must be a number`)
      }
      break
    case "boolean":
      if (value !== "true" && value !== "false" && typeof value !== "boolean") {
        errors.push(`${fieldName} must be a boolean`)
      }
      break
    case "object":
      try {
        if (typeof value === "string") {
          JSON.parse(value)
        } else if (typeof value !== "object") {
          throw new Error()
        }
      } catch (e) {
        errors.push(`${fieldName} must be a valid object`)
      }
      break
    case "array":
      try {
        const arr = typeof value === "string" ? JSON.parse(value) : value
        if (!Array.isArray(arr)) {
          throw new Error()
        }
      } catch (e) {
        errors.push(`${fieldName} must be a valid array`)
      }
      break
  }
}

