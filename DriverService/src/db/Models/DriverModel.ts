import mongoose, { Schema, type Document } from "mongoose"

// MongoDB interface for Driver document
export interface IDriverDocument extends Document {
  driverId: string
  name: string
  vehicleType: string
  licensePlate: string
  phoneNumber: string
  createdAt: Date
  updatedAt: Date
}

// Define MongoDB schema for Driver
// MongoDB only stores permanent driver details, NO location data
const DriverSchema: Schema = new Schema(
  {
    driverId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      default: "sedan",
    },
    licensePlate: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Create and export the MongoDB model
export const DriverModel = mongoose.model<IDriverDocument>("Driver", DriverSchema)

