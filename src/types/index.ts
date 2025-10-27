export enum EmployeeRole {
  ENSAM = "ensam",
  PRESENTAR = "presentar",
  RUNNER = "runner",
  DELAR = "delar",
}

export interface ICheckIn {
  employeeName: string;
  role: EmployeeRole;
  checkInTime: Date;
  checkOutTime: Date | null;
  isActive: boolean;
}
