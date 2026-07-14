import { get, post } from "../http-client.js";

export interface Booking {
  id: string;
  launch_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
}

export type BookingInput = Omit<Booking, "id">;

export const listBookings = async (): Promise<Booking[]> => get<Booking[]>("/api/bookings");

export const createBooking = async (input: BookingInput): Promise<Booking> =>
  post<Booking>("/api/bookings", input);
