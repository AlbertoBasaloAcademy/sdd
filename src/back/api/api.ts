import { Router } from "express";
import { getHealth } from "./health/health.controller.js";
import { getRocketById, getRockets, postRocket, putRocket } from "./rockets/rockets.controller.js";

export const apiRouter: Router = Router();

apiRouter.get("/health", getHealth);
apiRouter.get("/rockets", getRockets);
apiRouter.post("/rockets", postRocket);
apiRouter.get("/rockets/:id", getRocketById);
apiRouter.put("/rockets/:id", putRocket);

