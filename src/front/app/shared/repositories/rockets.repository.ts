import { del, get, post, put } from "../http-client.js";

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

export type RocketInput = Omit<Rocket, "id">;

export const listRockets = async (): Promise<Rocket[]> => get<Rocket[]>("/api/rockets");

export const createRocket = async (input: RocketInput): Promise<Rocket> =>
  post<Rocket>("/api/rockets", input);

export const updateRocket = async (id: string, input: RocketInput): Promise<Rocket> =>
  put<Rocket>(`/api/rockets/${id}`, input);

export const deactivateRocket = async (id: string): Promise<void> => del(`/api/rockets/${id}`);
