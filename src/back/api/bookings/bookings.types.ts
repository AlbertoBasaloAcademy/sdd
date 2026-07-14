export const BOOKABLE_LAUNCH_STATUSES = ["created", "confirmed"] as const;

export type BookableLaunchStatus = (typeof BOOKABLE_LAUNCH_STATUSES)[number];

export interface Booking {
  id: string;
  launch_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
}

export type NewBooking = Omit<Booking, "id">;

export const isBookableLaunchStatus = (status: string): status is BookableLaunchStatus =>
  (BOOKABLE_LAUNCH_STATUSES as readonly string[]).includes(status);

export const isValidEmail = (value: string): boolean => {
  const atIndex = value.indexOf("@");
  if (atIndex <= 0 || atIndex === value.length - 1) {
    return false;
  }
  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);
  return local.length > 0 && domain.length > 0 && domain.includes(".");
};
