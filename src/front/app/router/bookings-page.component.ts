import "../shared/components/page-header.component.js";
import { listBookings, type Booking } from "../shared/repositories/bookings.repository.js";
import { listLaunches, type Launch } from "../shared/repositories/launches.repository.js";
import { listRockets, type Rocket } from "../shared/repositories/rockets.repository.js";
import { bookingsStore } from "../shared/store/bookings.store.js";
import { showToast } from "../shared/toast.js";

export const tagName = "ab-bookings-page";

const formatScheduledAt = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

class BookingsPage extends HTMLElement {
  #launches: Launch[] = [];
  #rockets: Rocket[] = [];

  public connectedCallback(): void {
    this.innerHTML = `
      <ab-page-header heading="Bookings" subtitle="Passenger reservations for upcoming launches."></ab-page-header>
      <section class="fleet-section">
        <header class="fleet-toolbar">
          <div>
            <h2>Passenger Bookings</h2>
            <p id="booking-status" aria-live="polite">Loading bookings…</p>
          </div>
          <a href="/bookings/new" role="button" class="btn-sm">Create booking</a>
        </header>
        <div class="fleet-table-wrap">
          <table id="booking-table">
            <thead>
              <tr>
                <th scope="col">Passenger</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Launch</th>
              </tr>
            </thead>
            <tbody id="booking-list"></tbody>
          </table>
        </div>
      </section>`;

    const cached = bookingsStore.get();
    if (cached) {
      void this.#loadReferenceData().then(() => this.#renderBookings(cached));
    }
    void this.#loadBookings();
  }

  async #loadReferenceData(): Promise<void> {
    const [launches, rockets] = await Promise.all([listLaunches(), listRockets()]);
    this.#launches = launches;
    this.#rockets = rockets;
  }

  async #loadBookings(): Promise<void> {
    try {
      const [bookings, launches, rockets] = await Promise.all([
        listBookings(),
        listLaunches(),
        listRockets(),
      ]);
      this.#launches = launches;
      this.#rockets = rockets;
      bookingsStore.set(bookings);
      this.#renderBookings(bookings);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load bookings";
      this.querySelector("#booking-status")!.textContent = message;
      showToast(message, "error");
    }
  }

  #launchLabel(launchId: string): string {
    const launch = this.#launches.find((item) => item.id === launchId);
    if (!launch) {
      return launchId;
    }
    const rocket = this.#rockets.find((item) => item.id === launch.rocket_id);
    const rocketName = rocket?.name ?? launch.rocket_id;
    return `${rocketName} — ${formatScheduledAt(launch.scheduled_at)}`;
  }

  #renderBookings(bookings: Booking[]): void {
    const statusEl = this.querySelector("#booking-status");
    const listEl = this.querySelector("#booking-list");
    if (!statusEl || !listEl) {
      return;
    }

    statusEl.textContent = `${bookings.length} booking(s) recorded.`;

    if (bookings.length === 0) {
      listEl.innerHTML = `
        <tr>
          <td colspan="4" class="fleet-empty">No bookings yet.</td>
        </tr>`;
      return;
    }

    listEl.innerHTML = bookings
      .map(
        ({ id, launch_id, user_email, user_name, user_phone }) => `
        <tr data-booking-id="${id}">
          <td>${user_name}</td>
          <td>${user_email}</td>
          <td>${user_phone}</td>
          <td>${this.#launchLabel(launch_id)}</td>
        </tr>`,
      )
      .join("");
  }
}

customElements.define(tagName, BookingsPage);
