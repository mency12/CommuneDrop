import { DriverRepository } from "../repository/driver.repository"
import type {
  DriverLocation,
  NearbyDriversRequest,
  NearbyDriversResponse,
  CreateDriverRequest,
  DriverDetails,
  DriverStatus,
  DriverProfile,
  UpdateDriverRequest,
} from "../types"
import { logger } from "../utils/logger"
import { APIError, NotFoundError } from "../utils/error"

export class DriverService {
  private driverRepository: DriverRepository

  constructor() {
    this.driverRepository = new DriverRepository()
  }

  /**
   * Create a new driver in MongoDB (profile only)
   */
  async createDriver(driverData: CreateDriverRequest): Promise<void> {
    try {
      logger.info(`Creating new driver: ${driverData.driverId}`, {
        driverId: driverData.driverId,
        name: driverData.name,
      })

      await this.driverRepository.createDriver(driverData)

      logger.info(`Driver created successfully: ${driverData.driverId}`)
    } catch (error) {
      logger.error(`Error creating driver: ${driverData.driverId}`, error)
      throw new APIError(`Failed to create driver: ${error.message}`)
    }
  }

  /**
   * Update an existing driver in MongoDB (profile only)
   */
  async updateDriver(driverData: UpdateDriverRequest): Promise<void> {
    try {
      logger.info(`Updating driver: ${driverData.driverId}`, {
        driverId: driverData.driverId,
      })

      await this.driverRepository.updateDriver(driverData)

      logger.info(`Driver updated successfully: ${driverData.driverId}`)
    } catch (error) {
      logger.error(`Error updating driver: ${driverData.driverId}`, error)
      if (error instanceof NotFoundError) {
        throw error
      }
      throw new APIError(`Failed to update driver: ${error.message}`)
    }
  }

  /**
   * Get all drivers from MongoDB
   */
  async getAllDrivers(): Promise<DriverProfile[]> {
    try {
      logger.info("Getting all drivers")

      const drivers = await this.driverRepository.getAllDrivers()

      logger.info(`Successfully retrieved ${drivers.length} drivers`)
      return drivers
    } catch (error) {
      logger.error("Error getting all drivers", error)
      throw new APIError(`Failed to get all drivers: ${error.message}`)
    }
  }

  /**
   * Get driver profile from MongoDB
   */
  async getDriverProfile(driverId: string): Promise<DriverProfile> {
    try {
      logger.info(`Fetching profile for driver: ${driverId}`)

      const driverProfile = await this.driverRepository.getDriverProfile(driverId)

      if (!driverProfile) {
        logger.warn(`Driver profile not found for driver: ${driverId}`)
        throw new NotFoundError(`Driver profile not found: ${driverId}`)
      }

      logger.info(`Successfully retrieved profile for driver: ${driverId}`)
      return driverProfile
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      logger.error(`Error getting driver profile for driver: ${driverId}`, error)
      throw new APIError(`Failed to get driver profile: ${error.message}`)
    }
  }

  /**
   * Set driver status (online/offline)
   */
  async setDriverStatus(statusData: DriverStatus): Promise<void> {
    try {
      logger.info(
        `Setting status for driver: ${statusData.driverId} to ${statusData.isOnline ? "online" : "offline"}`,
        {
          driverId: statusData.driverId,
          isOnline: statusData.isOnline,
          latitude: statusData.latitude,
          longitude: statusData.longitude,
        },
      )

      await this.driverRepository.setDriverStatus(statusData)

      logger.info(
        `Driver status set successfully: ${statusData.driverId} is now ${statusData.isOnline ? "online" : "offline"}`,
      )
    } catch (error) {
      logger.error(`Error setting driver status: ${statusData.driverId}`, error)
      if (error instanceof NotFoundError) {
        throw error
      }
      throw new APIError(`Failed to set driver status: ${error.message}`)
    }
  }

  /**
   * Get driver details (MongoDB profile + Redis location if online)
   */
  async getDriverDetails(driverId: string): Promise<DriverDetails> {
    try {
      logger.info(`Fetching details for driver: ${driverId}`)

      const driverDetails = await this.driverRepository.getDriverDetails(driverId)

      if (!driverDetails) {
        logger.warn(`Driver details not found for driver: ${driverId}`)
        throw new NotFoundError(`Driver details not found for driver: ${driverId}`)
      }

      logger.info(`Successfully retrieved details for driver: ${driverId}`)
      return driverDetails
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      logger.error(`Error getting driver details for driver: ${driverId}`, error)
      throw new APIError(`Failed to get driver details: ${error.message}`)
    }
  }

  /**
   * Update driver location in Redis
   */
  async updateDriverLocation(driverLocation: DriverLocation): Promise<void> {
    try {
      logger.info(`Updating driver location for driver: ${driverLocation.driverId}`, {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        isOnline: driverLocation.isOnline,
      })

      await this.driverRepository.updateDriverLocation(driverLocation)

      logger.info(`Driver location updated successfully: ${driverLocation.driverId}`)
    } catch (error) {
      logger.error(`Error updating driver location for driver: ${driverLocation.driverId}`, error)
      throw new APIError(`Failed to update driver location: ${error.message}`)
    }
  }

  /**
   * Get driver location from Redis (only online drivers)
   */
  async getDriverLocation(driverId: string): Promise<DriverLocation> {
    try {
      logger.info(`Fetching location for driver: ${driverId}`)

      const driverLocation = await this.driverRepository.getDriverLocation(driverId)

      if (!driverLocation) {
        logger.warn(`Driver location not found for driver: ${driverId}`)
        throw new NotFoundError(`Driver location not found (driver may be offline): ${driverId}`)
      }

      logger.info(`Successfully retrieved location for driver: ${driverId}`)
      return driverLocation
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      logger.error(`Error getting driver location for driver: ${driverId}`, error)
      throw new APIError(`Failed to get driver location: ${error.message}`)
    }
  }

  /**
   * Find nearby drivers (only online drivers in Redis)
   */
  async findNearbyDrivers(request: NearbyDriversRequest): Promise<NearbyDriversResponse> {
    try {
      const { latitude, longitude, radius } = request

      logger.info(`Finding nearby drivers`, {
        latitude,
        longitude,
        radius: radius || "default",
      })

      const drivers = await this.driverRepository.findNearbyDrivers(latitude, longitude, radius)

      logger.info(`Found ${drivers.length} nearby drivers`)
      return { drivers }
    } catch (error) {
      logger.error("Error finding nearby drivers", error)
      throw new APIError(`Failed to find nearby drivers: ${error.message}`)
    }
  }
}

