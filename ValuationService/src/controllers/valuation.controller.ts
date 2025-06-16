import type { Response, NextFunction } from "express";
import { ValuationService } from "../services/valuation.service";
import type { ValuationReq } from "../types/valuation.type";
import { logger } from "../utils";
import type { AuthenticatedRequest } from "../types";
import { ValidationError } from "../utils/error";

export class ValuationController {
  private valuationService: ValuationService;

  constructor() {
    this.valuationService = new ValuationService();
  }

  async calculateValuation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const valuationReq: ValuationReq = req.body;
      const contextLogger = logger.child({
        requestId: req.id,
        clientId: req.user?.clientId,
        method: "calculateValuation",
      });
      contextLogger.info(`Processing valuation request`, {
        from: valuationReq.from_address,
        to: valuationReq.to_address,
        vehicleType: valuationReq.vehicle_type,
      });
      if (
        !valuationReq.from_address ||
        !valuationReq.to_address ||
        !valuationReq.vehicle_type
      ) {
        const missingFields = [];
        if (!valuationReq.from_address) missingFields.push("from_address");
        if (!valuationReq.to_address) missingFields.push("to_address");
        if (!valuationReq.vehicle_type) missingFields.push("vehicle_type");
        throw new ValidationError("Missing required fields", { missingFields });
      }
      const result = await this.valuationService.calculateValuation(
        valuationReq
      );
      contextLogger.info(`Valuation calculation completed successfully`, {
        distance: result.distance,
        time: result.time,
        cost: result.pricing_details.total_cost,
      });
      res.success(result);
    } catch (error) {
      logger.error(`Error in valuation calculation: ${error}`);
      next(error);
    }
  }
}
