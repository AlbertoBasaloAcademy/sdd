import type { Request, Response } from "express";
import { ApiError } from "../../server/errors.js";
import { createRocket, getRocket, listRockets, replaceRocket } from "./rockets.service.js";

const handleRocketMutation = (
  handler: () => unknown,
  res: Response,
  successStatus: number,
): void => {
  try {
    const result = handler();
    res.status(successStatus).json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    throw err;
  }
};

export const getRockets = (_req: Request, res: Response): void => {
  res.json(listRockets());
};

export const getRocketById = (req: Request, res: Response): void => {
  const rocket = getRocket(String(req.params["id"]));
  if (!rocket) {
    res.status(404).json({ error: "Rocket not found" });
    return;
  }
  res.json(rocket);
};

export const postRocket = (req: Request, res: Response): void => {
  handleRocketMutation(() => createRocket(req.body), res, 201);
};

export const putRocket = (req: Request, res: Response): void => {
  handleRocketMutation(
    () => replaceRocket(String(req.params["id"]), req.body),
    res,
    200,
  );
};
