import { createClient } from "redis"
import { logger } from "../utils/logger"


// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
})

// Handle connection events
redisClient.on("connect", () => {
  logger.info("Redis client connected")
})

redisClient.on("error", (err) => {
  logger.error("Redis client error", err)
})

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect()
  } catch (error) {
    logger.error("Failed to connect to Redis", error)
    process.exit(1)
  }
}

export { redisClient, connectRedis }

