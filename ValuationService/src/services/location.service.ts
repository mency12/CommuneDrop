import axios from "axios"
import { config } from "../config"
import { logger } from "../utils"
import { ServiceUnavailableError } from "../utils/error"

interface LocationResponse {
  distanceKm: number
  durationMinutes: number
}

export class LocationService {
    private readonly baseUrl: string

    constructor() {
        this.baseUrl = config.services.location
    }

    async getDistanceMatrix(fromAddress: string, toAddress: string): Promise<LocationResponse> {
        const contextLogger = logger.child({
        method: "getDistanceMatrix",
        service: "location",
        fromAddress: fromAddress.substring(0, 20) + "...",
        toAddress: toAddress.substring(0, 20) + "...",
        })
        try {
        contextLogger.info(`Fetching distance matrix`)
        const response = await axios.post(
            `${this.baseUrl}/matrix`,
            { fromAddress, toAddress },
            {
            timeout: 5000,
            headers: {
                "x-request-id": contextLogger.bindings()?.requestId || "unknown",
            },
            },
        )
        if (!response || !response.data) {
            contextLogger.error(`Empty response from location service`)
            throw new ServiceUnavailableError("Failed to get distance matrix from location service", "location")
        }
        contextLogger.info(`Distance matrix fetched successfully`, {
            distance: response.data.distanceKm,
            duration: response.data.durationMinutes,
        })
        return {
            distanceKm: response.data.distanceKm,
            durationMinutes: response.data.durationMinutes,
        }
        } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        contextLogger.error(`Error fetching distance matrix: ${errorMessage}`)
        if (axios.isAxiosError(error)) {
            if (error.code === "ECONNABORTED") {
            throw new ServiceUnavailableError("Location service request timed out", "location")
            }
            if (error.response) {
            throw new ServiceUnavailableError(
                `Location service error: ${error.response.status} ${error.response.statusText}`,
                "location",
            )
            } else if (error.request) {
            throw new ServiceUnavailableError("Location service is not responding", "location")
            }
        }
        throw new ServiceUnavailableError("Failed to communicate with location service", "location")
        }
    }
}

