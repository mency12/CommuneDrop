import express from "express"
import { ValuationController } from "../controllers/valuation.controller"
import { AuthMiddleware } from "../middlewares/auth.middleware"
import { ValidateRequest, valuationSchema } from "../middlewares/validation.middleware"

const router = express.Router()
const valuationController = new ValuationController()

router.post("/calculate", AuthMiddleware, ValidateRequest(valuationSchema), (req, res, next) =>
  valuationController.calculateValuation(req, res, next),
)

export default router

