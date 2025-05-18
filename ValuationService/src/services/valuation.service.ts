import type { ValuationReq, ValuationResp } from "../types/valuation.type"
import { config } from "../config"
import { LocationService } from "./location.service"
import { ValidationError, ServiceUnavailableError } from "../utils/error"
import { logger } from "../utils"

export class ValuationService {
    private locationService: LocationService

    constructor() {
        this.locationService = new LocationService()
    }

    async calculateValuation(valuationReq: ValuationReq): Promise<ValuationResp> {
        const { from_address, to_address, vehicle_type } = valuationReq
        const contextLogger = logger.child({
        method: "calculateValuation",
        vehicleType: vehicle_type,
        fromAddress: from_address.substring(0, 20) + "...",
        toAddress: to_address.substring(0, 20) + "...",
        })
        contextLogger.info(`Calculating valuation`)
        if (!config.pricing.vehicles[vehicle_type]) {
        contextLogger.warn(`Unsupported vehicle type: ${vehicle_type}`)
        throw new ValidationError(`Vehicle type '${vehicle_type}' is not supported`, {
            supportedTypes: Object.keys(config.pricing.vehicles),
        })
        }
        try {
        contextLogger.debug(`Fetching location data from location service`)
        const locationData = await this.locationService.getDistanceMatrix(from_address, to_address)
        const vehiclePricing = config.pricing.vehicles[vehicle_type]
        const cost = this.formatDecimal(vehiclePricing.basePrice * locationData.distanceKm)
        const rider_commission = this.formatDecimal(vehiclePricing.riderCommission * locationData.distanceKm)
        const tax = this.formatDecimal(cost * config.pricing.taxRate)
        const total_cost = this.formatDecimal(cost + tax)
        contextLogger.info(`Valuation calculated successfully`, {
            distance: locationData.distanceKm,
            duration: locationData.durationMinutes,
            cost,
            totalCost: total_cost,
        })
        return {
            pricing_details: {
            cost,
            rider_commission,
            tax,
            total_cost,
            },
            distance: locationData.distanceKm,
            time: locationData.durationMinutes,
        }
        } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        contextLogger.error(`Error calculating valuation: ${errorMessage}`)
        if (errorMessage.includes("location service")) {
            throw new ServiceUnavailableError("Unable to calculate distance at this time", "location")
        }
        if (error instanceof Error) {
            throw error
        }
        throw new ServiceUnavailableError("Failed to calculate valuation")
        }
    }

    private formatDecimal(value: number): number {
        return Math.round(value * 100) / 100
    }
}

