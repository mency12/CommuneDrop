import { ExpressApp } from "./express-app"
import { logger } from "./utils"
import { config } from "./config"

const PORT = config.app.port

export const StartServer = async () => {
  try {
    const expressApp = await ExpressApp()
    expressApp.listen(PORT, () => {
      logger.info(`Valuation Service is running on port ${PORT}`)
    })
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully")
      process.exit(0)
    })
    process.on("uncaughtException", (err) => {
      logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack })
      process.exit(1)
    })
    process.on("unhandledRejection", (reason, promise) => {
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
    })
  } catch (error) {
    logger.error(`Failed to start server: ${error}`)
    process.exit(1)
  }
}

StartServer().then(() => {
  logger.info(`Valuation Service started in ${config.app.env} mode`)
})