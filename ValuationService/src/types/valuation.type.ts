export interface ValuationReq {
  from_address: string
  to_address: string
  vehicle_type: "CAR" | "TRUCK" | "BIKE" | "WALK"
}

export interface ValuationResp {
  pricing_details: {
    cost: number
    rider_commission: number
    tax: number
    total_cost: number
  }
  distance: number
  time: number
}

export interface LocationResponse {
  distanceKm: number
  durationMinutes: number
}

