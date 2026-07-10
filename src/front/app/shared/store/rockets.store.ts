import { createStore } from "../../core/create-store.js";
import type { Rocket } from "../repositories/rockets.repository.js";

/** In-memory cache of the last /api/rockets payload. */
export const rocketsStore = createStore<Rocket[] | undefined>("rockets", undefined);
