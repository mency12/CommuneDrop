import mongoose from "mongoose"
import { logger } from "../utils/logger"
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/driver-service"

// Create MongoDB connection
const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI)
    logger.info("MongoDB connected successfully")
  } catch (error) {
    logger.error("MongoDB connection error", error)
    process.exit(1)
  }
}

// Handle MongoDB connection events
mongoose.connection.on("connected", () => {
  logger.info("MongoDB connection established")
})

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error", err)
})

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB connection disconnected")
})

// Handle application termination
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close()
    logger.info("MongoDB connection closed due to app termination")
    process.exit(0)
  } catch (error) {
    logger.error("Error during MongoDB disconnection", error)
    process.exit(1)
  }
})

export { connectMongoDB }

