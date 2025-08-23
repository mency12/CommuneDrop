import dotenv from "dotenv"
dotenv.config()

const requiredEnvVars = ["LOCATION_SERVICE_URL"]

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: Environment variable ${envVar} is required but not set`)
        process.exit(1)
    }
}

export const config = {
    app: {
        port: process.env.APP_PORT || 3002,
        env: process.env.NODE_ENV || "development",
    },
    services: {
        location: process.env.LOCATION_SERVICE_URL as string,
        auth: process.env.AUTH_SERVICE_BASE_URL || "http://localhost:9000",
    },
    pricing: {
        vehicles: {
        BIKE: {
            basePrice: 8,
            riderCommission: 2,
        },
        CAR: {
            basePrice: 14,
            riderCommission: 5,
        },
        TRUCK: {
            basePrice: 20,
            riderCommission: 10,
        },
        WALK: {
            basePrice: 5,
            riderCommission: 1.5,
        },
        },
        taxRate: 0.15,
    },
}

