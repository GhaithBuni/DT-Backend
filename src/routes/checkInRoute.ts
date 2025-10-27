import express, { Request, Response } from "express";
import CheckIn from "../models/checkInModel";
import { EmployeeRole } from "../types/index";

const router = express.Router();

interface CheckInBody {
  employeeName: string;
  role: EmployeeRole;
}

// Check in employee
router.post("/", async (req: Request<{}, {}, CheckInBody>, res: Response) => {
  try {
    const { employeeName, role } = req.body;

    // Validate role
    if (!Object.values(EmployeeRole).includes(role)) {
      return res.status(400).json({
        message:
          "Invalid role. Must be one of: ensam, presentar, runner, delar",
      });
    }

    // Check if employee is already checked in
    const existingCheckIn = await CheckIn.findOne({
      employeeName,
      isActive: true,
    });

    if (existingCheckIn) {
      return res.status(400).json({
        message: "Employee is already checked in",
      });
    }

    const checkIn = new CheckIn({
      employeeName,
      role,
      checkInTime: new Date(),
    });

    await checkIn.save();
    res.status(201).json(checkIn);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Check out employee
router.post("/checkout/:id", async (req: Request, res: Response) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id);

    if (!checkIn) {
      return res.status(404).json({ message: "Check-in not found" });
    }

    if (!checkIn.isActive) {
      return res
        .status(400)
        .json({ message: "Employee is already checked out" });
    }

    checkIn.checkOutTime = new Date();
    checkIn.isActive = false;

    await checkIn.save();
    res.json(checkIn);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get all currently checked in employees
router.get("/active", async (req: Request, res: Response) => {
  try {
    const activeCheckIns = await CheckIn.find({ isActive: true }).sort({
      checkInTime: -1,
    });
    res.json(activeCheckIns);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get check-in history
router.get("/history", async (req: Request, res: Response) => {
  try {
    const history = await CheckIn.find().sort({ checkInTime: -1 }).limit(100);
    res.json(history);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get statistics by role
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const stats = await CheckIn.aggregate([
      {
        $group: {
          _id: "$role",
          activeCount: {
            $sum: { $cond: ["$isActive", 1, 0] },
          },
          totalCheckIns: { $sum: 1 },
        },
      },
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
