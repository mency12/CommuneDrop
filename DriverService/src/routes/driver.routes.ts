import { Router } from "express"
import { DriverController } from "../controllers/driver.controller"
import { validateRequest } from "../middleware/validatereq.middleware"
import { logger } from "../utils/logger"

const router = Router()
const driverController = new DriverController()

/**
 * @swagger
 * /drivers:
 *   post:
 *     summary: Create a new driver
 *     description: Creates a new driver profile in the system
 *     tags: [Drivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDriverRequest'
 *     responses:
 *       201:
 *         description: Driver created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/",
  validateRequest({
    body: {
      driverId: { type: "string", required: true },
      name: { type: "string", required: true },
      vehicleType: { type: "string", required: false },
      licensePlate: { type: "string", required: false },
      phoneNumber: { type: "string", required: false },
    },
  }),
  (req, res, next) => {
    logger.info("Create driver request received", {
      driverId: req.body.driverId,
      name: req.body.name,
    })
    return driverController.createDriver(req, res, next)
  },
)

/**
 * @swagger
 * /drivers/{driverId}:
 *   put:
 *     summary: Update an existing driver
 *     description: Updates an existing driver's profile information
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the driver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDriverRequest'
 *     responses:
 *       200:
 *         description: Driver updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Driver not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/:driverId",
  validateRequest({
    params: ["driverId"],
    body: {
      name: { type: "string", required: false },
      vehicleType: { type: "string", required: false },
      licensePlate: { type: "string", required: false },
      phoneNumber: { type: "string", required: false },
    },
  }),
  (req, res, next) => {
    logger.info("Update driver request received", {
      driverId: req.params.driverId,
    })
    return driverController.updateDriver(req, res, next)
  },
)

/**
 * @swagger
 * /drivers/all:
 *   get:
 *     summary: Get all drivers
 *     description: Retrieves a list of all driver profiles
 *     tags: [Drivers]
 *     responses:
 *       200:
 *         description: List of drivers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/all", (req, res, next) => {
  logger.info("Get all drivers request received")
  return driverController.getAllDrivers(req, res, next)
})

/**
 * @swagger
 * /drivers/nearby:
 *   get:
 *     summary: Find nearby drivers
 *     description: Finds drivers within a specified radius of the given coordinates
 *     tags: [Drivers]
 *     parameters:
 *       - in: header
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: header
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: Search radius in kilometers
 *     responses:
 *       200:
 *         description: Nearby drivers found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NearbyDriversResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/nearby",
  validateRequest({
    headers: ["latitude", "longitude"],
    query: {
      radius: { type: "number", required: false },
    },
  }),
  (req, res, next) => {
    logger.info("Find nearby drivers request received", {
      latitude: req.headers["latitude"],
      longitude: req.headers["longitude"],
      radius: req.query.radius,
    })
    return driverController.findNearbyDrivers(req, res, next)
  },
)

/**
 * @swagger
 * /drivers/{driverId}/status:
 *   patch:
 *     summary: Set driver status
 *     description: Sets a driver's online/offline status and location if online
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the driver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DriverStatusRequest'
 *     responses:
 *       200:
 *         description: Driver status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Driver not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/:driverId/status",
  validateRequest({
    params: ["driverId"],
    body: {
      isOnline: { type: "boolean", required: true },
      latitude: { type: "number", required: false },
      longitude: { type: "number", required: false },
    },
  }),
  (req, res, next) => {
    logger.info("Set driver status request received", {
      driverId: req.params.driverId,
      isOnline: req.body.isOnline,
    })
    return driverController.setDriverStatus(req, res, next)
  },
)

/**
 * @swagger
 * /drivers/location:
 *   post:
 *     summary: Update driver location
 *     description: Updates a driver's current location
 *     tags: [Drivers]
 *     parameters:
 *       - in: header
 *         name: driver-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the driver
 *       - in: header
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: header
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isOnline:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Driver location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/location",
  validateRequest({
    headers: ["driver-id", "latitude", "longitude"],
    body: {
      isOnline: { type: "boolean", required: false },
    },
  }),
  (req, res, next) => {
    logger.info("Update driver location request received", {
      driverId: req.headers["driver-id"],
      latitude: req.headers["latitude"],
      longitude: req.headers["longitude"],
    })
    return driverController.updateDriverLocation(req, res, next)
  },
)

/**
 * @swagger
 * /drivers/{driverId}/details:
 *   get:
 *     summary: Get driver details
 *     description: Retrieves complete details for a driver including profile and location
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the driver
 *     responses:
 *       200:
 *         description: Driver details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Driver not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:driverId/details", (req, res, next) => {
  logger.info("Get driver details request received", { driverId: req.params.driverId })
  return driverController.getDriverDetails(req, res, next)
})

/**
 * @swagger
 * /drivers/{driverId}:
 *   get:
 *     summary: Get driver location
 *     description: Retrieves the current location of a driver
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the driver
 *     responses:
 *       200:
 *         description: Driver location retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Driver location not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:driverId", (req, res, next) => {
  logger.info("Get driver location request received", { driverId: req.params.driverId })
  return driverController.getDriverLocation(req, res, next)
})

export default router

