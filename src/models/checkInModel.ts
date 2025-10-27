import mongoose, { Document, Schema, Types } from "mongoose";

export enum EmployeeRole {
  ENSAM = "ensam",
  PRESENTAR = "presentar",
  RUNNER = "runner",
  DELAR = "delar",
}

export interface ICheckIn extends Document {
  employeeName: string;
  role: EmployeeRole;
  checkInTime: Date;
  checkOutTime: Date | null;
  isActive: boolean;
}
const checkInSchema = new Schema<ICheckIn>({
  employeeName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(EmployeeRole),
    trim: true,
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  checkOutTime: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const checkInModel = mongoose.model<ICheckIn>("CheckIn", checkInSchema);

export default checkInModel;
