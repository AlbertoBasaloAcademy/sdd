import cors from "cors";
import express from "express";
import { apiRouter } from "./api/api.js";
import { startHealthTracking } from "./api/health/health.service.js";
import { startLaunches } from "./api/launches/launches.service.js";
import { startRockets } from "./api/rockets/rockets.service.js";
import { port } from "./server/config.js";
import { errorHandler } from "./server/errors.js";
import { listen } from "./server/listener.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.use(errorHandler);

startHealthTracking();
startRockets();
startLaunches();
listen(app, port);
