import { createStore } from "../../core/create-store.js";
import type { Booking } from "../repositories/bookings.repository.js";

/** In-memory cache of the last /api/bookings payload. */
export const bookingsStore = createStore<Booking[] | undefined>("bookings", undefined);
