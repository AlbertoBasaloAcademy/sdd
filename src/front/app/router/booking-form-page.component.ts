import "../shared/components/page-header.component.js";
import { createBooking } from "../shared/repositories/bookings.repository.js";
import {
  BOOKABLE_LAUNCH_STATUSES,
  listLaunches,
  type Launch,
} from "../shared/repositories/launches.repository.js";
import { listRockets, type Rocket } from "../shared/repositories/rockets.repository.js";
import { showToast } from "../shared/toast.js";

export const tagName = "ab-booking-form-page";

const formatScheduledAt = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

class BookingFormPage extends HTMLElement {
  #availableLaunches: Launch[] = [];
  #rockets: Rocket[] = [];

  public connectedCallback(): void {
    this.innerHTML = `
      <ab-page-header
        heading="Create booking"
        subtitle="Reserve a passenger seat on an available launch.">
      </ab-page-header>
      <form id="booking-form" novalidate>
        <label>
          Launch
          <select name="launch_id" required>
            <option value="">Select a launch…</option>
          </select>
        </label>
        <label>
          Passenger name
          <input name="user_name" required />
        </label>
        <label>
          Email
          <input name="user_email" type="email" required />
        </label>
        <label>
          Phone
          <input name="user_phone" required />
        </label>
        <p id="form-error" role="alert"></p>
        <button type="submit">Create booking</button>
        <a href="/bookings">Cancel</a>
      </form>`;

    this.querySelector("#booking-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.#submit();
    });

    void this.#loadFormData();
  }

  async #loadFormData(): Promise<void> {
    try {
      const [launches, rockets] = await Promise.all([listLaunches(), listRockets()]);
      this.#rockets = rockets;
      this.#availableLaunches = launches.filter((launch) =>
        (BOOKABLE_LAUNCH_STATUSES as readonly string[]).includes(launch.status),
      );
      this.#renderLaunchOptions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load launches";
      this.#setError(message);
      showToast(message, "error");
    }
  }

  #renderLaunchOptions(): void {
    const select = this.querySelector<HTMLSelectElement>('select[name="launch_id"]');
    if (!select) {
      return;
    }

    const options = this.#availableLaunches
      .map((launch) => {
        const rocket = this.#rockets.find((item) => item.id === launch.rocket_id);
        const rocketName = rocket?.name ?? launch.rocket_id;
        const label = `${rocketName} — ${formatScheduledAt(launch.scheduled_at)} (${launch.status})`;
        return `<option value="${launch.id}">${label}</option>`;
      })
      .join("");

    select.innerHTML = `<option value="">Select a launch…</option>${options}`;
  }

  #setError(message: string): void {
    const errorEl = this.querySelector("#form-error");
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  async #submit(): Promise<void> {
    const form = this.querySelector<HTMLFormElement>("#booking-form");
    if (!form) {
      return;
    }

    this.#setError("");
    const data = new FormData(form);
    const launch_id = String(data.get("launch_id") ?? "");
    const user_name = String(data.get("user_name") ?? "");
    const user_email = String(data.get("user_email") ?? "");
    const user_phone = String(data.get("user_phone") ?? "");

    if (!launch_id) {
      this.#setError("Launch is required");
      showToast("Launch is required", "error");
      return;
    }

    try {
      await createBooking({ launch_id, user_email, user_name, user_phone });
      showToast("Booking created", "success");
      globalThis.location.assign("/bookings");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create booking";
      this.#setError(message);
      showToast(message, "error");
    }
  }
}

customElements.define(tagName, BookingFormPage);
