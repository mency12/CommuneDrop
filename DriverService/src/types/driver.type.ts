// Redis - Location data only
export interface DriverLocation {
  driverId: string
  latitude: number
  longitude: number
  timestamp: number
  isOnline: boolean // Renamed from isAvailable to isOnline for clarity
}

// MongoDB - Driver profile data only
export interface DriverProfile {
  driverId: string
  name: string
  vehicleType: string
  licensePlate: string
  phoneNumber: string
}

// Combined data from both databases
export interface DriverDetails extends DriverProfile {
  // Optional location data that may be included if driver is online
  latitude?: number
  longitude?: number
  timestamp?: number
  isOnline?: boolean // Renamed from isAvailable to isOnline
}

export interface NearbyDriversRequest {
  latitude: number
  longitude: number
  radius?: number // in kilometers, optional with default
}

export interface NearbyDriversResponse {
  drivers: DriverLocation[]
}

export interface CreateDriverRequest {
  driverId: string
  name: string
  vehicleType?: string
  licensePlate?: string
  phoneNumber?: string
}

export interface UpdateDriverRequest {
  driverId: string
  name?: string
  vehicleType?: string
  licensePlate?: string
  phoneNumber?: string
}

export interface DriverStatus {
  driverId: string
  isOnline: boolean // Changed from status string to boolean isOnline
  latitude?: number
  longitude?: number
}

