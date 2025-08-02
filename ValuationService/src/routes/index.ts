import express from "express"
import valuationRoute from "./valuation.route"

const router = express.Router()

router.use("/valuation", valuationRoute)

export default router

