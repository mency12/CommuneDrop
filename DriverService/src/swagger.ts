import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import path from "path"

// Get the current directory
const currentDir = __dirname

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Driver Service API",
      version: "1.0.0",
      description: "API for managing driver profiles, locations, and finding nearby drivers",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
      {
        url: "https://api.example.com",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Drivers",
        description: "Driver management endpoints",
      },
      {
        name: "Health",
        description: "Service health check endpoints",
      },
    ],
    paths: {
      "/drivers": {
        post: {
          tags: ["Drivers"],
          summary: "Create a new driver",
          description: "Creates a new driver profile in the system",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateDriverRequest",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Driver created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
            400: {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/drivers/all": {
        get: {
          tags: ["Drivers"],
          summary: "Get all drivers",
          description: "Retrieves a list of all driver profiles",
          responses: {
            200: {
              description: "List of drivers retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/drivers/nearby": {
        get: {
          tags: ["Drivers"],
          summary: "Find nearby drivers",
          description: "Finds drivers within a specified radius of the given coordinates",
          parameters: [
            {
              in: "header",
              name: "latitude",
              required: true,
              schema: {
                type: "number",
              },
              description: "Latitude coordinate",
            },
            {
              in: "header",
              name: "longitude",
              required: true,
              schema: {
                type: "number",
              },
              description: "Longitude coordinate",
            },
            {
              in: "query",
              name: "radius",
              schema: {
                type: "number",
                default: 5,
              },
              description: "Search radius in kilometers",
            },
          ],
          responses: {
            200: {
              description: "Nearby drivers found successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/NearbyDriversResponse",
                  },
                },
              },
            },
            400: {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/drivers/{driverId}": {
        get: {
          tags: ["Drivers"],
          summary: "Get driver location",
          description: "Retrieves the current location of a driver",
          parameters: [
            {
              in: "path",
              name: "driverId",
              required: true,
              schema: {
                type: "string",
              },
              description: "Unique identifier of the driver",
            },
          ],
          responses: {
            200: {
              description: "Driver location retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
            404: {
              description: "Driver location not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ["Drivers"],
          summary: "Update an existing driver",
          description: "Updates an existing driver's profile information",
          parameters: [
            {
              in: "path",
              name: "driverId",
              required: true,
              schema: {
                type: "string",
              },
              description: "Unique identifier of the driver",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateDriverRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Driver updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
            404: {
              description: "Driver not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/drivers/{driverId}/details": {
        get: {
          tags: ["Drivers"],
          summary: "Get driver details",
          description: "Retrieves complete details for a driver including profile and location",
          parameters: [
            {
              in: "path",
              name: "driverId",
              required: true,
              schema: {
                type: "string",
              },
              description: "Unique identifier of the driver",
            },
          ],
          responses: {
            200: {
              description: "Driver details retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
            404: {
              description: "Driver not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/drivers/{driverId}/status": {
        patch: {
          tags: ["Drivers"],
          summary: "Set driver status",
          description: "Sets a driver's online/offline status and location if online",
          parameters: [
            {
              in: "path",
              name: "driverId",
              required: true,
              schema: {
                type: "string",
              },
              description: "Unique identifier of the driver",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DriverStatusRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Driver status updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
            400: {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            404: {
              description: "Driver not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/drivers/location": {
        post: {
          tags: ["Drivers"],
          summary: "Update driver location",
          description: "Updates a driver's current location",
          parameters: [
            {
              in: "header",
              name: "driver-id",
              required: true,
              schema: {
                type: "string",
              },
              description: "Unique identifier of the driver",
            },
            {
              in: "header",
              name: "latitude",
              required: true,
              schema: {
                type: "number",
              },
              description: "Latitude coordinate",
            },
            {
              in: "header",
              name: "longitude",
              required: true,
              schema: {
                type: "number",
              },
              description: "Longitude coordinate",
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    isOnline: {
                      type: "boolean",
                      default: true,
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Driver location updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
            400: {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          description: "Returns the health status of the driver service",
          responses: {
            200: {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      service: {
                        type: "string",
                        example: "driver-service",
                      },
                      status: {
                        type: "string",
                        example: "healthy",
                      },
                      redis: {
                        type: "string",
                        example: "connected",
                      },
                      timestamp: {
                        type: "string",
                        format: "date-time",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        DriverProfile: {
          type: "object",
          properties: {
            driverId: {
              type: "string",
              example: "driver123",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            vehicleType: {
              type: "string",
              example: "sedan",
            },
            licensePlate: {
              type: "string",
              example: "ABC123",
            },
            phoneNumber: {
              type: "string",
              example: "+1234567890",
            },
          },
        },
        DriverLocation: {
          type: "object",
          properties: {
            driverId: {
              type: "string",
              example: "driver123",
            },
            latitude: {
              type: "number",
              example: 37.7749,
            },
            longitude: {
              type: "number",
              example: -122.4194,
            },
            timestamp: {
              type: "number",
              example: 1625097600000,
            },
            isOnline: {
              type: "boolean",
              example: true,
            },
          },
        },
        DriverDetails: {
          type: "object",
          properties: {
            driverId: {
              type: "string",
              example: "driver123",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            vehicleType: {
              type: "string",
              example: "sedan",
            },
            licensePlate: {
              type: "string",
              example: "ABC123",
            },
            phoneNumber: {
              type: "string",
              example: "+1234567890",
            },
            latitude: {
              type: "number",
              example: 37.7749,
            },
            longitude: {
              type: "number",
              example: -122.4194,
            },
            timestamp: {
              type: "number",
              example: 1625097600000,
            },
            isOnline: {
              type: "boolean",
              example: true,
            },
          },
        },
        CreateDriverRequest: {
          type: "object",
          required: ["driverId", "name"],
          properties: {
            driverId: {
              type: "string",
              example: "driver123",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            vehicleType: {
              type: "string",
              example: "sedan",
            },
            licensePlate: {
              type: "string",
              example: "ABC123",
            },
            phoneNumber: {
              type: "string",
              example: "+1234567890",
            },
          },
        },
        UpdateDriverRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "John Doe",
            },
            vehicleType: {
              type: "string",
              example: "sedan",
            },
            licensePlate: {
              type: "string",
              example: "ABC123",
            },
            phoneNumber: {
              type: "string",
              example: "+1234567890",
            },
          },
        },
        DriverStatusRequest: {
          type: "object",
          required: ["isOnline"],
          properties: {
            isOnline: {
              type: "boolean",
              example: true,
            },
            latitude: {
              type: "number",
              example: 37.7749,
            },
            longitude: {
              type: "number",
              example: -122.4194,
            },
          },
        },
        NearbyDriversResponse: {
          type: "object",
          properties: {
            drivers: {
              type: "array",
              items: {
                $ref: "#/components/schemas/DriverLocation",
              },
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation successful",
            },
            data: {
              type: "object",
              example: {},
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2023-01-01T00:00:00.000Z",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              example: "An error occurred",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2023-01-01T00:00:00.000Z",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Use absolute paths to ensure the files are found correctly
  apis: [
    path.join(currentDir, "routes", "*.ts"),
    path.join(currentDir, "routes", "*.js"),
    path.join(currentDir, "controllers", "*.ts"),
    path.join(currentDir, "controllers", "*.js"),
    "./routes/*.ts",
    "./routes/*.js",
    "./controllers/*.ts",
    "./controllers/*.js",
  ],
}

export const specs = swaggerJsdoc(options)
export const serve = swaggerUi.serve
export const setup = swaggerUi.setup(specs, {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
})

