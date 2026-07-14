export const LAUNCH_STATUSES = ["created", "confirmed", "cancelled", "completed"] as const;

export type LaunchStatus = (typeof LAUNCH_STATUSES)[number];

export const CANCELLATION_REASONS = ["economic", "technical", "meteorological"] as const;

export type CancellationReason = (typeof CANCELLATION_REASONS)[number];

export interface Launch {
  id: string;
  rocket_id: string;
  scheduled_at: string;
  price_per_passenger: number;
  status: LaunchStatus;
  cancellation_reason?: CancellationReason;
}

export type NewLaunch = Omit<Launch, "id">;

export type LaunchUpdate = Partial<Omit<Launch, "id">>;

export const TERMINAL_LAUNCH_STATUSES: readonly LaunchStatus[] = ["cancelled", "completed"];

export const isTerminalLaunchStatus = (status: LaunchStatus): boolean =>
  (TERMINAL_LAUNCH_STATUSES as readonly string[]).includes(status);

export const VALID_STATUS_TRANSITIONS: Record<LaunchStatus, readonly LaunchStatus[]> = {
  cancelled: [],
  completed: [],
  confirmed: ["cancelled", "completed"],
  created: ["confirmed", "cancelled"],
};

export const MIN_PRICE_PER_PASSENGER = 1000;
export const PRICE_STEP = 1000;
export const SCHEDULE_COLLISION_BUFFER_MS = 30 * 24 * 60 * 60 * 1000;
export const ECONOMIC_CANCELLATION_BUFFER_MS = 7 * 24 * 60 * 60 * 1000;

export const isValidPrice = (value: number): boolean =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= MIN_PRICE_PER_PASSENGER &&
  value % PRICE_STEP === 0;

export const isCancellationReason = (value: unknown): value is CancellationReason =>
  typeof value === "string" && (CANCELLATION_REASONS as readonly string[]).includes(value);
