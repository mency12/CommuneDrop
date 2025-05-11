import { Router } from "express"
import { logger } from "../utils/logger"

const router = Router()

/**
 * @swagger
 * tags:
 *   - name: Drivers
 *     description: Driver management endpoints
 *   - name: Health
 *     description: Service health check endpoints
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Information
 *     description: Returns basic information about the driver service API
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Service information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   type: string
 *                   example: driver-service
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 description:
 *                   type: string
 *                 endpoints:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get("/", (req, res) => {
  logger.info("API information request received")
  res.status(200).json({
    service: "driver-service",
    version: "1.0.0",
    description: "API for managing driver profiles, locations, and finding nearby drivers",
    endpoints: [
      "/drivers",
      "/drivers/all",
      "/drivers/nearby",
      "/drivers/:driverId",
      "/drivers/:driverId/details",
      "/drivers/:driverId/status",
      "/drivers/location",
      "/health",
    ],
  })
})

export default router

