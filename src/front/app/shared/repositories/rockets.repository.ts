import { get, post, put } from "../http-client.js";

export type RocketStatus = "available" | "maintenance" | "in_flight";

export type RocketRange = "Earth Orbit" | "The Moon" | "Mars";

export interface Rocket {
  id: string;
  name: string;
  model: string;
  capacity: number;
  status: RocketStatus;
  range: RocketRange;
}

export interface RocketInput {
  name: string;
  model: string;
  capacity: number;
  status: RocketStatus;
  range: RocketRange;
}

export const ROCKET_STATUSES: RocketStatus[] = ["available", "maintenance", "in_flight"];

export const ROCKET_RANGES: RocketRange[] = ["Earth Orbit", "The Moon", "Mars"];

export const MAX_CAPACITY = 10;

export const listRockets = async (): Promise<Rocket[]> => get<Rocket[]>("/api/rockets");

export const getRocket = async (id: string): Promise<Rocket> => get<Rocket>(`/api/rockets/${id}`);

export const createRocket = async (input: RocketInput): Promise<Rocket> =>
  post<Rocket>("/api/rockets", input);

export const updateRocket = async (id: string, input: RocketInput): Promise<Rocket> =>
  put<Rocket>(`/api/rockets/${id}`, input);
