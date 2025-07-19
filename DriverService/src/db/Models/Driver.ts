import type { DriverLocation } from "../../types"

export class Driver implements DriverLocation {
  driverId: string
  latitude: number
  longitude: number
  timestamp: number
  isOnline: boolean

  constructor(data: DriverLocation) {
    this.driverId = data.driverId
    this.latitude = data.latitude
    this.longitude = data.longitude
    this.timestamp = data.timestamp || Date.now()
    this.isOnline = data.isOnline !== undefined ? data.isOnline : true
  }

  toJSON(): DriverLocation {
    return {
      driverId: this.driverId,
      latitude: this.latitude,
      longitude: this.longitude,
      timestamp: this.timestamp,
      isOnline: this.isOnline,
    }
  }
}

