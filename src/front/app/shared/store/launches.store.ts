import { createStore } from "../../core/create-store.js";
import type { Launch } from "../repositories/launches.repository.js";

/** In-memory cache of the last /api/launches payload. */
export const launchesStore = createStore<Launch[] | undefined>("launches", undefined);
