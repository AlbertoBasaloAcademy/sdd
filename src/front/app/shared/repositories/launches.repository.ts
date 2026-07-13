import { get, post, put } from "../http-client.js";

export const LAUNCH_STATUSES = ["created", "confirmed", "cancelled", "completed"] as const;

export type LaunchStatus = (typeof LAUNCH_STATUSES)[number];

export interface Launch {
  id: string;
  rocket_id: string;
  scheduled_at: string;
  price_per_passenger: number;
  status: LaunchStatus;
}

export type LaunchCreateInput = Pick<Launch, "rocket_id" | "scheduled_at" | "price_per_passenger">;

export type LaunchUpdateInput = Partial<
  Pick<Launch, "rocket_id" | "scheduled_at" | "price_per_passenger" | "status">
>;

export const listLaunches = async (): Promise<Launch[]> => get<Launch[]>("/api/launches");

export const createLaunch = async (input: LaunchCreateInput): Promise<Launch> =>
  post<Launch>("/api/launches", input);

export const updateLaunch = async (id: string, input: LaunchUpdateInput): Promise<Launch> =>
  put<Launch>(`/api/launches/${id}`, input);
