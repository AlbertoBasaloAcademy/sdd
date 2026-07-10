/** Maximum allowed capacity (exclusive — valid values are strictly below this). */
export const MAX_CAPACITY = 10;

export const ROCKET_STATUSES = ["available", "maintenance", "in_flight"] as const;

export const ROCKET_RANGES = ["Earth Orbit", "The Moon", "Mars"] as const;

export const isValidCapacity = (capacity: number): boolean =>
  Number.isInteger(capacity) && capacity >= 0 && capacity < MAX_CAPACITY;

/** Operational state of a rocket in the fleet. */
export type RocketStatus = (typeof ROCKET_STATUSES)[number];

/** Destinations this rocket can reach. */
export type RocketRange = (typeof ROCKET_RANGES)[number];

/** Wire format of rocket resources. */
export interface Rocket {
  id: string;
  name: string;
  model: string;
  capacity: number;
  status: RocketStatus;
  range: RocketRange;
}

/** Fields required to insert a new rocket (id is assigned by the database). */
export interface NewRocket {
  name: string;
  model: string;
  capacity: number;
  status: RocketStatus;
  range: RocketRange;
}

/** Payload accepted by create and update endpoints. */
export type RocketInput = NewRocket;
