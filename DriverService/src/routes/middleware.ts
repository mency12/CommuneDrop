import { Router } from "express"
import driverRoutes from "./driver.routes"
import healthRoutes from "./health.routes"
import docRoutes from "./doc.routes"

const router = Router()

// API documentation route
router.use("/", docRoutes)

// Health check route
router.use("/health", healthRoutes)

// API routes
router.use("/drivers", driverRoutes)

export default router