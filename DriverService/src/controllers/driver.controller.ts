import type { Request, Response, NextFunction } from "express"
import { DriverService } from "../service/driver.service"
import type {
  DriverLocation,
  NearbyDriversRequest,
  CreateDriverRequest,
  DriverStatus,
  UpdateDriverRequest,
} from "../types"
import { logger } from "../utils/logger"
import { createApiResponse } from "../utils/response"
import { ValidationError, STATUS_CODES, HandleErrorWithLogger } from "../utils/error"

export class DriverController {
  private driverService: DriverService

  constructor() {
    this.driverService = new DriverService()
  }

  /**
   * Create a new driver in MongoDB
   * - Stores ONLY driver profile, NO location data
   */
  createDriver = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info("Creating new driver", { body: req.body })

      const { driverId, name, vehicleType, licensePlate, phoneNumber } = req.body

      if (!driverId || !name) {
        logger.warn("Missing required fields for driver creation", { body: req.body })
        throw new ValidationError("Missing required fields: driverId, name")
      }

      const createDriverRequest: CreateDriverRequest = {
        driverId,
        name,
        vehicleType: vehicleType || "sedan",
        licensePlate: licensePlate || "",
        phoneNumber: phoneNumber || "",
      }

      await this.driverService.createDriver(createDriverRequest)
      logger.info("Driver created successfully", { driverId })

      // Get the created driver profile to return in the response
      const driverProfile = await this.driverService.getDriverProfile(driverId)

      createApiResponse(res, "Driver created successfully", STATUS_CODES.CREATED, driverProfile)
    } catch (error) {
      logger.error("Error in createDriver controller", error)
      HandleErrorWithLogger(error as Error, req, res, next)
    }
  }

  /**
   * Update an existing driver in MongoDB
   * - Updates ONLY driver profile, NO location data
   */
  updateDriver = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { driverId } = req.params
      logger.info("Updating driver details", { driverId, body: req.body })

      if (!driverId) {
        logger.warn("Missing driver ID for update", { params: req.params })
        throw new ValidationError("Driver ID is required")
      }

      const updateDriverRequest: UpdateDriverRequest = {
        driverId,
        ...req.body,
      }

      await this.driverService.updateDriver(updateDriverRequest)
      logger.info("Driver updated successfully", { driverId })

      // Get the updated driver profile to return in the response
      const driverProfile = await this.driverService.getDriverProfile(driverId)

      createApiResponse(res, "Driver updated successfully", STATUS_CODES.OK, driverProfile)
    } catch (error) {
      logger.error("Error in updateDriver controller", error)
      HandleErrorWithLogger(error as Error, req, res, next)
    }
  }

  /**
   * Get all drivers from MongoDB
   */
  getAllDrivers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info("Getting all drivers")

      const drivers = await this.driverService.getAllDrivers()
      logger.info("Drivers retrieved successfully", { count: drivers.length })

      createApiResponse(res, "Drivers retrieved successfully", STATUS_CODES.OK, drivers)
    } catch (error) {
      logger.error("Error in getAllDrivers controller", error)
      HandleErrorWithLogger(error as Error, req, res, next)
    }
  }

  /**
   * Set driver status (online/offline)
   * - For online: adds driver to Redis with location data
   * - For offline: removes driver from Redis
   */
  setDriverStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info("Setting driver status", { params: req.params, body: req.body })

      const { driverId } = req.params
      const { isOnline, latitude, longitude } = req.body

      if (!driverId || isOnline === undefined) {
        logger.warn("Missing required fields for status update", { params: req.params, body: req.body })
        throw new ValidationError("Missing required fields: driverId, isOnline")
      }

      // If driver is online, latitude and longitude are required
      if (isOnline && (latitude === undefined || longitude === undefined)) {
        logger.warn("Missing location data for online status", { body: req.body })
        throw new ValidationError("Latitude and longitude are required when setting status to online")
      }

      const statusData: DriverStatus = {
        driverId,
        isOnline: Boolean(isOnline),
        ...(isOnline ? { latitude: Number(latitude), longitude: Number(longitude) } : {}),
      }

      await this.driverService.setDriverStatus(statusData)
      logger.info("Driver status updated successfully", { driverId, isOnline })

      // Get the current driver details to return in the response
      let responseData: any = { driverId, isOnline: Boolean(isOnline) }

      // If driver is online, try to get full details
      if (isOnline) {
        try {
          const driverDetails = await this.driverService.getDriverDetails(driverId)
          responseData = driverDetails
        } catch (error) {
          // If we can't get details, just return the status update confirmation
          logger.warn("Could not retrieve driver details after status update", { error })
        }
      }

      createApiResponse(res, "Driver status updated successfully", STATUS_CODES.OK, responseData)
    } catch (error) {
      logger.error("Error in setDriverStatus controller", error)
      HandleErrorWithLogger(error as Error, req, res, next)
    }
  }

  /**
   * Update driver location in Redis
   * - Only updates location for online drivers
   */
  updateDriverLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info("Updating driver location", { headers: req.headers, body: req.body })

      const driverId = req.headers["driver-id"] as string
      const latitude = Number.parseFloat(req.headers["latitude"] as string)
      const longitude = Number.parseFloat(req.headers["longitude"] as string)

      // Validate required headers
      if (!driverId || isNaN(latitude) || isNaN(longitude)) {
        logger.warn("Missing or invalid headers for driver location update", {
          driverId,
          latitude,
          longitude,
        })
        throw new ValidationError("Missing or invalid headers: driver-id, latitude, longitude")
      }

      // Get online status from request body or default to true
      const isOnline = req.body.isOnline !== undefined ? Boolean(req.body.isOnline) : true

      const driverLocation: DriverLocation = {
        driverId,
        latitude,
        longitude,
        timestamp: Date.now(),
        isOnline,
      }

      await this.driverService.updateDriverLocation(driverLocation)
      logger.info("Driver location updated successfully", { driverId, isOnline })

      createApiResponse(res, "Driver location updated successfully", STATUS_CODES.OK, driverLocation)
    } catch (error) {
      logger.error("Error in updateDriverLocation controller", error)
      HandleErrorWithLogger(error as Error, req, res, next)
    }
  }

  /**
   * Get driver details (combines MongoDB profile and Redis location)
   */
  getDriverDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { driverId } = req.params
      logger.info("Getting driver details", { driverId })

      if (!driverId) {
        logger.warn("Missing driver ID", { params: req.params })
        throw new ValidationError("Driver ID is required")
      }

      const driverDetails = await this.driverService.getDriverDetails(driverId)
      logger.info("Driver details retrieved successfully", { driverId })

      createApiResponse(res, "Driver details retrieved successfully", STATUS_CODES.OK, driverDetails)
    } catch (error) {
      logger.error("Error in getDriverDetails controller", error)
      HandleErrorWithLogger(error as Error, req, res, next)
    }
  }

  /**
   * Get driver location from Redis (only for online drivers)
   */
  getDriverLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { driverId } = req.params
      logger.info("Getting driver location", { driverId })

      if (!driverId) {
        logger.warn("Missing driver ID", { params: req.params })
        throw new ValidationError("Driver ID is required")
      }

      const driverLocation = await this.driverService.getDriverLocation(driverId)
      logger.info("Driver location retrieved successfully", { driverId })

      createApiResponse(res, "Driver location retrieved successfully", STATUS_CODES.OK, driverLocation)
    } catch (error) {
      logger.error("Error in getDriverLocation controller", error)
      HandleErrorWithLogger(error as Error, req, res, next)
    }
  }

  /**
   * Find nearby drivers (only online drivers in Redis)
   */
  findNearbyDrivers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info("Finding nearby drivers", { headers: req.headers, query: req.query })

      const latitude = Number.parseFloat(req.headers["latitude"] as string)
      const longitude = Number.parseFloat(req.headers["longitude"] as string)

      // Validate required headers
      if (isNaN(latitude) || isNaN(longitude)) {
        logger.warn("Missing or invalid location headers", { latitude, longitude })
        throw new ValidationError("Missing or invalid headers: latitude, longitude")
      }

      // Get radius from query params or default to 5km
      const radius = req.query.radius ? Number.parseFloat(req.query.radius as string) : 5

      if (isNaN(radius) || radius <= 0) {
        logger.warn("Invalid radius parameter", { radius })
        throw new ValidationError("Invalid radius parameter")
      }

      const request: NearbyDriversRequest = {
        latitude,
        longitude,
        radius,
      }

      const response = await this.driverService.findNearbyDrivers(request)
      logger.info("Nearby drivers found", { count: response.drivers?.length || 0 })

      createApiResponse(res, "Nearby drivers found successfully", STATUS_CODES.OK, response)
    } catch (error) {
      logger.error("Error in findNearbyDrivers controller", error)
      HandleErrorWithLogger(error as Error, req, res, next)
    }
  }
}

