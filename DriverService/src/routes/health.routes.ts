import { Router } from "express"
import { redisClient } from "../db/redis"
import { createApiResponse } from "../utils/response"
import { logger } from "../utils/logger"
import { STATUS_CODES } from "../utils/error"

const router = Router()

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns the health status of the driver service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   type: string
 *                   example: driver-service
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 redis:
 *                   type: string
 *                   example: connected
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/", (req, res) => {
  try {
    logger.info("Health check initiated")

    // Check Redis connection
    const redisStatus = redisClient.isReady ? "connected" : "disconnected"

    logger.info(`Redis status: ${redisStatus}`)

    createApiResponse(res, "Health check successful", STATUS_CODES.OK, {
      service: "driver-service",
      status: "healthy",
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Health check failed", error)
    createApiResponse(res, "Health check failed", STATUS_CODES.INTERNAL_ERROR)
  }
})

export default router

