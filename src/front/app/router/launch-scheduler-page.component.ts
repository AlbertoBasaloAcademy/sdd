import "../shared/components/page-header.component.js";
import {
  CANCELLATION_REASONS,
  listLaunches,
  updateLaunch,
  type CancellationReason,
  type Launch,
  type LaunchStatus,
} from "../shared/repositories/launches.repository.js";
import { listRockets, type Rocket } from "../shared/repositories/rockets.repository.js";
import { launchesStore } from "../shared/store/launches.store.js";
import { showToast } from "../shared/toast.js";

export const tagName = "ab-launch-scheduler-page";

const TERMINAL_STATUSES: LaunchStatus[] = ["cancelled", "completed"];

const formatScheduledAt = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatPrice = (price: number): string =>
  new Intl.NumberFormat(undefined, { currency: "USD", style: "currency" }).format(price);

class LaunchSchedulerPage extends HTMLElement {
  #rockets: Rocket[] = [];
  #pendingCancelId: string | null = null;

  public connectedCallback(): void {
    this.innerHTML = `
      <ab-page-header heading="Launch Scheduler" subtitle="Schedule and manage upcoming flights."></ab-page-header>
      <section class="fleet-section">
        <header class="fleet-toolbar">
          <div>
            <h2>Scheduled Launches</h2>
            <p id="launch-status" aria-live="polite">Loading launches…</p>
          </div>
          <a href="/launches/new" role="button" class="btn-sm">Schedule launch</a>
        </header>
        <div class="fleet-table-wrap">
          <table id="launch-table">
            <thead>
              <tr>
                <th scope="col">Rocket</th>
                <th scope="col">Scheduled</th>
                <th scope="col">Price / passenger</th>
                <th scope="col">Status</th>
                <th scope="col" class="fleet-actions-heading">Actions</th>
              </tr>
            </thead>
            <tbody id="launch-list"></tbody>
          </table>
        </div>
      </section>
      <dialog id="cancel-dialog">
        <article>
          <header>
            <button type="button" aria-label="Close" rel="prev" id="cancel-dialog-close"></button>
            <h3>Cancel launch</h3>
          </header>
          <p>Select a reason for cancelling this launch.</p>
          <label for="cancel-reason">Cancellation reason</label>
          <select id="cancel-reason" name="cancellation_reason" required>
            <option value="">Select a reason…</option>
            ${CANCELLATION_REASONS.map(
              (reason) => `<option value="${reason}">${reason}</option>`,
            ).join("")}
          </select>
          <p id="cancel-dialog-error" class="form-error" hidden></p>
          <footer>
            <button type="button" class="secondary" id="cancel-dialog-dismiss">Keep launch</button>
            <button type="button" id="cancel-dialog-confirm">Confirm cancellation</button>
          </footer>
        </article>
      </dialog>`;

    this.querySelector("#cancel-dialog-close")?.addEventListener("click", () => this.#closeCancelDialog());
    this.querySelector("#cancel-dialog-dismiss")?.addEventListener("click", () =>
      this.#closeCancelDialog(),
    );
    this.querySelector("#cancel-dialog-confirm")?.addEventListener("click", () => {
      void this.#confirmCancellation();
    });

    const cached = launchesStore.get();
    if (cached) {
      void this.#loadRockets().then(() => this.#renderLaunches(cached));
    }
    void this.#loadLaunches();
  }

  async #loadRockets(): Promise<void> {
    this.#rockets = await listRockets();
  }

  async #loadLaunches(): Promise<void> {
    try {
      const [launches, rockets] = await Promise.all([listLaunches(), listRockets()]);
      this.#rockets = rockets;
      launchesStore.set(launches);
      this.#renderLaunches(launches);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load launches";
      this.querySelector("#launch-status")!.textContent = message;
      showToast(message, "error");
    }
  }

  #rocketName(rocketId: string): string {
    return this.#rockets.find((rocket) => rocket.id === rocketId)?.name ?? rocketId;
  }

  #renderLaunches(launches: Launch[]): void {
    const statusEl = this.querySelector("#launch-status");
    const listEl = this.querySelector("#launch-list");
    if (!statusEl || !listEl) {
      return;
    }

    statusEl.textContent = `${launches.length} launch(es) scheduled.`;

    if (launches.length === 0) {
      listEl.innerHTML = `
        <tr>
          <td colspan="5" class="fleet-empty">No launches scheduled yet.</td>
        </tr>`;
      return;
    }

    listEl.innerHTML = launches.map((launch) => this.#renderRow(launch)).join("");

    listEl.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset["action"];
        const id = button.dataset["id"] ?? "";
        if (action === "cancelled") {
          this.#openCancelDialog(id);
          return;
        }
        void this.#handleAction(id, action as LaunchStatus);
      });
    });
  }

  #renderRow(launch: Launch): string {
    const isTerminal = TERMINAL_STATUSES.includes(launch.status);
    const actions = isTerminal
      ? `<span class="fleet-empty">—</span>`
      : `
          <a href="/launches/${launch.id}/edit" role="button" class="secondary outline btn-sm">Edit</a>
          ${this.#statusButtons(launch)}`;

    const statusLabel =
      launch.status === "cancelled" && launch.cancellation_reason
        ? `${launch.status} (${launch.cancellation_reason})`
        : launch.status;

    return `
      <tr>
        <th scope="row">${this.#rocketName(launch.rocket_id)}</th>
        <td>${formatScheduledAt(launch.scheduled_at)}</td>
        <td>${formatPrice(launch.price_per_passenger)}</td>
        <td><span class="fleet-status fleet-status-${launch.status}">${statusLabel}</span></td>
        <td class="fleet-actions">${actions}</td>
      </tr>`;
  }

  #statusButtons(launch: Launch): string {
    const buttons: string[] = [];
    if (launch.status === "created") {
      buttons.push(
        `<button type="button" class="secondary outline btn-sm" data-id="${launch.id}" data-action="confirmed">Confirm</button>`,
        `<button type="button" class="secondary outline btn-sm" data-id="${launch.id}" data-action="cancelled">Cancel</button>`,
      );
    }
    if (launch.status === "confirmed") {
      buttons.push(
        `<button type="button" class="secondary outline btn-sm" data-id="${launch.id}" data-action="completed">Complete</button>`,
        `<button type="button" class="secondary outline btn-sm" data-id="${launch.id}" data-action="cancelled">Cancel</button>`,
      );
    }
    return buttons.join("");
  }

  #openCancelDialog(id: string): void {
    if (!id) {
      showToast("Invalid launch id", "error");
      return;
    }
    this.#pendingCancelId = id;
    const dialog = this.querySelector<HTMLDialogElement>("#cancel-dialog");
    const reasonSelect = this.querySelector<HTMLSelectElement>("#cancel-reason");
    const errorEl = this.querySelector<HTMLParagraphElement>("#cancel-dialog-error");
    if (!dialog || !reasonSelect || !errorEl) {
      return;
    }
    reasonSelect.value = "";
    errorEl.hidden = true;
    errorEl.textContent = "";
    dialog.showModal();
  }

  #closeCancelDialog(): void {
    this.#pendingCancelId = null;
    this.querySelector<HTMLDialogElement>("#cancel-dialog")?.close();
  }

  async #confirmCancellation(): Promise<void> {
    const id = this.#pendingCancelId;
    const reasonSelect = this.querySelector<HTMLSelectElement>("#cancel-reason");
    const errorEl = this.querySelector<HTMLParagraphElement>("#cancel-dialog-error");
    if (!id || !reasonSelect || !errorEl) {
      return;
    }

    const reason = reasonSelect.value as CancellationReason | "";
    if (!reason) {
      errorEl.textContent = "Select a cancellation reason";
      errorEl.hidden = false;
      return;
    }

    errorEl.hidden = true;
    errorEl.textContent = "";

    try {
      await updateLaunch(id, { cancellation_reason: reason, status: "cancelled" });
      showToast("Launch cancelled", "success");
      this.#closeCancelDialog();
      launchesStore.set(undefined);
      await this.#loadLaunches();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel launch";
      errorEl.textContent = message;
      errorEl.hidden = false;
      showToast(message, "error");
    }
  }

  async #handleAction(id: string, status: LaunchStatus): Promise<void> {
    if (!id) {
      showToast("Invalid launch id", "error");
      return;
    }
    try {
      await updateLaunch(id, { status });
      showToast(`Launch ${status}`, "success");
      launchesStore.set(undefined);
      await this.#loadLaunches();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update launch";
      showToast(message, "error");
    }
  }
}

customElements.define(tagName, LaunchSchedulerPage);
