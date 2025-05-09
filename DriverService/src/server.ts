import express from "express"
import cors from "cors"
import helmet from "helmet"
import { connectRedis } from "./db/redis"
import { connectMongoDB } from "./db/mongodb"
import routes from "./routes/middleware"
import { HandleErrorWithLogger } from "./utils/error/handler"
import { logger } from "./utils/logger"
import { APIError } from "./utils/error"
import { serve, setup } from "./swagger"

// Initialize express app
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(
  helmet({
    // Allow Swagger UI to be properly displayed
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  }),
)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  })
  next()
})

// Swagger documentation
app.use("/api-docs", serve, setup)

// Routes
app.use(routes)

// 404 handler for undefined routes
app.use((req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`)
  next(new APIError(`Route not found: ${req.method} ${req.url}`))
})

// Error handler
app.use(HandleErrorWithLogger)

// Process uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error)
  process.exit(1)
})

// Process unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise })
  process.exit(1)
})

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB()
    logger.info("Connected to MongoDB successfully")

    // Connect to Redis
    await connectRedis()
    logger.info("Connected to Redis successfully")

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Driver service running on port ${PORT}`)
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`)
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    logger.error("Failed to start server", error)
    process.exit(1)
  }
}

startServer()

export default app

