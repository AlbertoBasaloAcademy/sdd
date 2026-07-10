import type { Request, Response } from "express";
import { ApiError } from "../../server/errors.js";
import { createRocket, listRockets, removeRocket, replaceRocket } from "./rockets.service.js";

const sendMutation = <T>(action: () => T, res: Response, successStatus: number): void => {
  try {
    const result = action();
    if (successStatus === 204) {
      res.status(successStatus).send();
      return;
    }
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

export const getRockets = (_req: Request, res: Response): void => {
  res.json(listRockets());
};

export const postRocket = (req: Request, res: Response): void => {
  sendMutation(() => createRocket(req.body), res, 201);
};

export const putRocket = (req: Request, res: Response): void => {
  sendMutation(() => replaceRocket(String(req.params["id"]), req.body), res, 200);
};

export const deleteRocketById = (req: Request, res: Response): void => {
  sendMutation(() => {
    removeRocket(String(req.params["id"]));
    return undefined;
  }, res, 204);
};
