import { Router } from "express";
import { getHealth } from "./health/health.controller.js";
import {
  deleteRocketById,
  getRockets,
  postRocket,
  putRocket,
} from "./rockets/rockets.controller.js";

export const apiRouter: Router = Router();

apiRouter.get("/health", getHealth);
apiRouter.get("/rockets", getRockets);
apiRouter.post("/rockets", postRocket);
apiRouter.put("/rockets/:id", putRocket);
apiRouter.delete("/rockets/:id", deleteRocketById);

