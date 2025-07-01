import type { Request, Response, NextFunction } from "express"
import { ValidationError } from "../utils/error"
import { logger } from "../utils/logger"
import Joi from "joi"

export const ValidateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        })
        if (error) {
        const details = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
        }))
        logger.debug(`Validation failed for ${req.path}`, {
            requestId: req.id,
            details,
        })
        return next(new ValidationError("Validation failed", details))
        }
        req.body = value
        next()
    }
}

export const valuationSchema = Joi.object({
    from_address: Joi.string().required().min(3).max(255),
    to_address: Joi.string().required().min(3).max(255),
    vehicle_type: Joi.string().valid("CAR", "TRUCK", "BIKE", "WALK").required(),
})

