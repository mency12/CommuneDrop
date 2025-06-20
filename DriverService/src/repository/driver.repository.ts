import { redisClient } from "../db/redis"
import { DriverModel } from "../db/Models/DriverModel"
import type {
  DriverLocation,
  CreateDriverRequest,
  DriverDetails,
  DriverStatus,
  DriverProfile,
  UpdateDriverRequest,
} from "../types"
import { logger } from "../utils/logger"
import { APIError, NotFoundError } from "../utils/error"

// Key prefixes
const DRIVER_LOCATION_KEY_PREFIX = "driver:location:"
const DRIVER_GEO_KEY = "driver:geo"

export class DriverRepository {
  /**
   * Create a new driver in MongoDB
   * - Stores permanent driver details ONLY
   */
  async createDriver(driverData: CreateDriverRequest): Promise<void> {
    try {
      const { driverId, name, vehicleType, licensePlate, phoneNumber } = driverData

      // Check if driver already exists in MongoDB
      const existingDriver = await DriverModel.findOne({ driverId })
      if (existingDriver) {
        logger.warn(`Driver already exists in MongoDB: ${driverId}`, { driverId })
        throw new APIError(`Driver already exists: ${driverId}`)
      }

      // Create new driver in MongoDB - store ONLY profile data, NO location
      await DriverModel.create({
        driverId,
        name,
        vehicleType: vehicleType || "sedan",
        licensePlate: licensePlate || "",
        phoneNumber: phoneNumber || "",
      })

      logger.info(`Driver created in MongoDB: ${driverId}`, { driverId })
    } catch (error) {
      logger.error("Error creating driver in MongoDB", { error, driverId: driverData.driverId })
      throw new APIError(`Failed to create driver: ${error.message}`)
    }
  }

  /**
   * Update an existing driver in MongoDB
   * - Updates permanent driver details ONLY
   */
  async updateDriver(driverData: UpdateDriverRequest): Promise<void> {
    try {
      const { driverId, ...updateData } = driverData

      // Check if driver exists in MongoDB
      const existingDriver = await DriverModel.findOne({ driverId })
      if (!existingDriver) {
        logger.warn(`Driver not found in MongoDB: ${driverId}`, { driverId })
        throw new NotFoundError(`Driver not found: ${driverId}`)
      }

      // Update driver in MongoDB - update ONLY profile data, NO location
      await DriverModel.updateOne({ driverId }, { $set: updateData })

      logger.info(`Driver updated in MongoDB: ${driverId}`, { driverId })
    } catch (error) {
      logger.error("Error updating driver in MongoDB", { error, driverId: driverData.driverId })
      throw error instanceof NotFoundError ? error : new APIError(`Failed to update driver: ${error.message}`)
    }
  }

  /**
   * Get all drivers from MongoDB
   */
  async getAllDrivers(): Promise<DriverProfile[]> {
    try {
      // Get all drivers from MongoDB
      const drivers = await DriverModel.find({})

      // Map to driver profile data
      return drivers.map((driver) => ({
        driverId: driver.driverId,
        name: driver.name,
        vehicleType: driver.vehicleType,
        licensePlate: driver.licensePlate,
        phoneNumber: driver.phoneNumber,
      }))
    } catch (error) {
      logger.error("Error getting all drivers from MongoDB", { error })
      throw new APIError(`Failed to get all drivers: ${error.message}`)
    }
  }

  /**
   * Get driver profile from MongoDB
   */
  async getDriverProfile(driverId: string): Promise<DriverProfile | null> {
    try {
      // Get driver from MongoDB
      const driver = await DriverModel.findOne({ driverId })

      if (!driver) {
        logger.warn(`Driver profile not found in MongoDB: ${driverId}`, { driverId })
        return null
      }

      // Return driver profile data
      return {
        driverId: driver.driverId,
        name: driver.name,
        vehicleType: driver.vehicleType,
        licensePlate: driver.licensePlate,
        phoneNumber: driver.phoneNumber,
      }
    } catch (error) {
      logger.error(`Error getting driver profile: ${driverId}`, { error, driverId })
      throw new APIError(`Failed to get driver profile: ${error.message}`)
    }
  }

  /**
   * Set driver online status
   * - For online: add driver to Redis with location data
   * - For offline: remove driver from Redis
   */
  async setDriverStatus(statusData: DriverStatus): Promise<void> {
    try {
      const { driverId, isOnline, latitude, longitude } = statusData

      // Check if driver exists in MongoDB
      const driverExists = await DriverModel.exists({ driverId })
      if (!driverExists) {
        logger.warn(`Driver not found in MongoDB: ${driverId}`, { driverId })
        throw new NotFoundError(`Driver not found: ${driverId}`)
      }

      if (isOnline) {
        // Driver is coming online, add to Redis
        if (latitude === undefined || longitude === undefined) {
          throw new APIError("Latitude and longitude are required for online status")
        }

        const driverLocation: DriverLocation = {
          driverId,
          latitude,
          longitude,
          timestamp: Date.now(),
          isOnline: true,
        }

        await this.saveDriverLocation(driverLocation)
        logger.info(`Driver ${driverId} is now online`, { driverId, latitude, longitude })
      } else {
        // Driver is going offline, remove from Redis
        const driverKey = `${DRIVER_LOCATION_KEY_PREFIX}${driverId}`

        // Remove from hash store
        await redisClient.del(driverKey)

        // Remove from geo index
        await redisClient.zRem(DRIVER_GEO_KEY, driverId)

        logger.info(`Driver ${driverId} is now offline, removed from Redis`, { driverId })
      }
    } catch (error) {
      // Pass through NotFoundError
      if (error instanceof NotFoundError) {
        throw error
      }

      logger.error("Error setting driver status", {
        error,
        driverId: statusData.driverId,
        isOnline: statusData.isOnline,
      })
      throw new APIError(`Failed to set driver status: ${error.message}`)
    }
  }

  /**
   * Save driver location in Redis (only for online drivers)
   * - Stores ONLY location data, NO driver details
   */
  async saveDriverLocation(driverLocation: DriverLocation): Promise<void> {
    try {
      const { driverId, latitude, longitude, isOnline } = driverLocation

      // Only store in Redis if driver is online
      if (!isOnline) {
        // If driver is not online, remove from Redis
        const driverKey = `${DRIVER_LOCATION_KEY_PREFIX}${driverId}`
        await redisClient.del(driverKey)
        await redisClient.zRem(DRIVER_GEO_KEY, driverId)
        logger.info(`Driver ${driverId} is offline, removed from Redis`, { driverId })
        return
      }

      const driverKey = `${DRIVER_LOCATION_KEY_PREFIX}${driverId}`

      // Store driver location in a hash - ONLY location data
      await redisClient.hSet(driverKey, {
        driverId,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        timestamp: Date.now().toString(),
        isOnline: "1",
      })

      // Set expiry for driver location (24 hours)
      await redisClient.expire(driverKey, 24 * 60 * 60)

      // Add to geo index for location queries
      await redisClient.geoAdd(DRIVER_GEO_KEY, {
        longitude,
        latitude,
        member: driverId,
      })

      logger.info(`Driver location saved in Redis: ${driverId}`, { driverId, isOnline })
    } catch (error) {
      logger.error("Error saving driver location in Redis", { error, driverId: driverLocation.driverId })
      throw new APIError(`Failed to save driver location: ${error.message}`)
    }
  }

  /**
   * Get driver location from Redis (only for online drivers)
   */
  async getDriverLocation(driverId: string): Promise<DriverLocation | null> {
    try {
      const driverKey = `${DRIVER_LOCATION_KEY_PREFIX}${driverId}`
      const driverData = await redisClient.hGetAll(driverKey)

      if (!driverData || Object.keys(driverData).length === 0) {
        logger.info(`Driver location not found in Redis: ${driverId}`, { driverId })
        return null
      }

      return {
        driverId: driverData.driverId,
        latitude: Number.parseFloat(driverData.latitude),
        longitude: Number.parseFloat(driverData.longitude),
        timestamp: Number.parseInt(driverData.timestamp, 10),
        isOnline: driverData.isOnline === "1",
      }
    } catch (error) {
      logger.error(`Error getting driver location from Redis: ${driverId}`, { error, driverId })
      throw new APIError(`Failed to get driver location: ${error.message}`)
    }
  }

  /**
   * Get driver details by combining MongoDB profile and Redis location
   */
  async getDriverDetails(driverId: string): Promise<DriverDetails | null> {
    try {
      // Get profile from MongoDB
      const driverProfile = await this.getDriverProfile(driverId)

      if (!driverProfile) {
        logger.warn(`Driver profile not found in MongoDB: ${driverId}`, { driverId })
        return null
      }

      // Base driver details from profile
      const driverDetails: DriverDetails = {
        ...driverProfile,
      }

      // Try to get location from Redis if driver is online
      const locationData = await this.getDriverLocation(driverId)

      // Merge location data if available
      if (locationData) {
        driverDetails.latitude = locationData.latitude
        driverDetails.longitude = locationData.longitude
        driverDetails.timestamp = locationData.timestamp
        driverDetails.isOnline = locationData.isOnline
      }

      logger.info(`Driver details retrieved for: ${driverId}`, { driverId })
      return driverDetails
    } catch (error) {
      logger.error(`Error getting driver details: ${driverId}`, { error, driverId })
      throw new APIError(`Failed to get driver details: ${error.message}`)
    }
  }

  /**
   * Find nearby drivers within a radius (only online drivers in Redis)
   */
  async findNearbyDrivers(latitude: number, longitude: number, radius = 5): Promise<DriverLocation[]> {
    try {
      logger.info("Finding nearby drivers", { latitude, longitude, radius })

      // Find drivers within radius
      const geoResults = await redisClient.geoSearch(
        DRIVER_GEO_KEY,
        {
          longitude,
          latitude,
        },
        {
          radius,
          unit: "km",
        },
      )

      if (!geoResults || geoResults.length === 0) {
        logger.info("No nearby drivers found", { latitude, longitude, radius })
        return []
      }

      // Get driver details for each nearby driver
      const driverPromises = geoResults.map((driverId) => this.getDriverLocation(driverId))

      const drivers = await Promise.all(driverPromises)

      // Filter out null values and only return online drivers
      const onlineDrivers = drivers.filter((driver): driver is DriverLocation => driver !== null && driver.isOnline)

      logger.info(`Found ${onlineDrivers.length} nearby drivers`, {
        count: onlineDrivers.length,
        totalFound: geoResults.length,
      })

      return onlineDrivers
    } catch (error) {
      logger.error("Error finding nearby drivers", { error, latitude, longitude, radius })
      throw new APIError(`Failed to find nearby drivers: ${error.message}`)
    }
  }

  /**
   * Update driver location in Redis
   * - Only for online drivers
   * - If driver is set to offline, removes from Redis
   */
  async updateDriverLocation(driverLocation: DriverLocation): Promise<void> {
    try {
      // Save location (this will handle online/offline status)
      await this.saveDriverLocation(driverLocation)

      logger.info(`Driver location updated: ${driverLocation.driverId}`, {
        driverId: driverLocation.driverId,
        isOnline: driverLocation.isOnline,
      })
    } catch (error) {
      logger.error(`Error updating driver location: ${driverLocation.driverId}`, {
        error,
        driverId: driverLocation.driverId,
      })
      throw new APIError(`Failed to update driver location: ${error.message}`)
    }
  }
}

