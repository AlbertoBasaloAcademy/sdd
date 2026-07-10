export const ROCKET_RANGES = ["Earth Orbit", "The Moon", "Mars"] as const;
export const ROCKET_STATUSES = ["Active", "Inactive"] as const;

export type RocketRange = (typeof ROCKET_RANGES)[number];
export type RocketStatus = (typeof ROCKET_STATUSES)[number];

export interface Rocket {
  id: string;
  name: string;
  serial_number: string;
  capacity: number;
  range: RocketRange;
  status: RocketStatus;
}

export type NewRocket = Omit<Rocket, "id">;

export const MIN_CAPACITY = 1;
export const MAX_CAPACITY = 9;

export const isValidCapacity = (value: number): boolean =>
  Number.isInteger(value) && value >= MIN_CAPACITY && value <= MAX_CAPACITY;
