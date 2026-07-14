import type { Request, Response } from "express";
import { ApiError } from "../../server/errors.js";
import { createBooking, listBookings } from "./bookings.service.js";

const sendMutation = <T>(action: () => T, res: Response, successStatus: number): void => {
  try {
    const result = action();
    res.status(successStatus).json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    process.stderr.write(`${String(err)}\n`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBookings = (_req: Request, res: Response): void => {
  res.json(listBookings());
};

export const postBooking = (req: Request, res: Response): void => {
  sendMutation(() => createBooking(req.body), res, 201);
};
