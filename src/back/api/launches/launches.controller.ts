import type { Request, Response } from "express";
import { ApiError } from "../../server/errors.js";
import { createLaunch, listLaunches, replaceLaunch } from "./launches.service.js";

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

export const getLaunches = (_req: Request, res: Response): void => {
  res.json(listLaunches());
};

export const postLaunch = (req: Request, res: Response): void => {
  sendMutation(() => createLaunch(req.body), res, 201);
};

export const putLaunch = (req: Request, res: Response): void => {
  sendMutation(() => replaceLaunch(String(req.params["id"]), req.body), res, 200);
};
