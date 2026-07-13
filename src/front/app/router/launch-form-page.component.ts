import "../shared/components/page-header.component.js";
import {
  createLaunch,
  listLaunches,
  updateLaunch,
  type Launch,
  type LaunchCreateInput,
} from "../shared/repositories/launches.repository.js";
import {
  listRockets,
  type Rocket,
} from "../shared/repositories/rockets.repository.js";
import { launchesStore } from "../shared/store/launches.store.js";
import { showToast } from "../shared/toast.js";

export const tagName = "ab-launch-form-page";

const toDatetimeLocalValue = (iso: string): string => {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
};

class LaunchFormPage extends HTMLElement {
  #launchId: string | undefined;
  #activeRockets: Rocket[] = [];

  public connectedCallback(): void {
    this.#launchId = this.getAttribute("launch-id") ?? undefined;
    const isEdit = this.#launchId !== undefined && this.#launchId !== "new";

    this.innerHTML = `
      <ab-page-header
        heading="${isEdit ? "Edit launch" : "Schedule launch"}"
        subtitle="Pick an active rocket, a future date and time, and a price per passenger.">
      </ab-page-header>
      <form id="launch-form">
        <label>
          Rocket
          <select name="rocket_id" required id="rocket-select">
            <option value="">Loading rockets…</option>
          </select>
        </label>
        <label>
          Scheduled date and time
          <input name="scheduled_at" type="datetime-local" required />
        </label>
        <label>
          Price per passenger
          <input name="price_per_passenger" type="number" min="0.01" step="0.01" required />
        </label>
        <p id="form-error" role="alert"></p>
        <button type="submit">${isEdit ? "Save changes" : "Schedule launch"}</button>
        <a href="/launches">Cancel</a>
      </form>`;

    this.querySelector("#launch-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.#submit();
    });

    void this.#init(isEdit);
  }

  async #init(isEdit: boolean): Promise<void> {
    try {
      const rockets = await listRockets();
      this.#activeRockets = rockets.filter((rocket) => rocket.status === "Active");
      this.#renderRocketOptions();

      if (isEdit && this.#launchId) {
        await this.#loadLaunch(this.#launchId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load form data";
      showToast(message, "error");
    }
  }

  #renderRocketOptions(): void {
    const select = this.querySelector<HTMLSelectElement>("#rocket-select");
    if (!select) {
      return;
    }
    if (this.#activeRockets.length === 0) {
      select.innerHTML = `<option value="">No active rockets available</option>`;
      return;
    }
    select.innerHTML = this.#activeRockets
      .map((rocket) => `<option value="${rocket.id}">${rocket.name}</option>`)
      .join("");
  }

  async #loadLaunch(id: string): Promise<void> {
    const cached = launchesStore.get()?.find((launch) => launch.id === id);
    const launch = cached ?? (await listLaunches()).find((item) => item.id === id);
    if (!launch) {
      showToast("Launch not found", "error");
      globalThis.location.assign("/launches");
      return;
    }
    if (launch.status === "cancelled" || launch.status === "completed") {
      showToast("Launch cannot be edited in terminal status", "error");
      globalThis.location.assign("/launches");
      return;
    }
    this.#fillForm(launch);
  }

  #fillForm(launch: Launch): void {
    const form = this.querySelector<HTMLFormElement>("#launch-form");
    if (!form) {
      return;
    }
    (form.elements.namedItem("rocket_id") as HTMLSelectElement).value = launch.rocket_id;
    (form.elements.namedItem("scheduled_at") as HTMLInputElement).value = toDatetimeLocalValue(
      launch.scheduled_at,
    );
    (form.elements.namedItem("price_per_passenger") as HTMLInputElement).value = String(
      launch.price_per_passenger,
    );
  }

  #readInput(): LaunchCreateInput | undefined {
    const form = this.querySelector<HTMLFormElement>("#launch-form");
    if (!form) {
      return undefined;
    }
    const scheduledLocal = (form.elements.namedItem("scheduled_at") as HTMLInputElement).value;
    const scheduled_at = new Date(scheduledLocal).toISOString();
    const price = Number((form.elements.namedItem("price_per_passenger") as HTMLInputElement).value);
    return {
      price_per_passenger: price,
      rocket_id: (form.elements.namedItem("rocket_id") as HTMLSelectElement).value,
      scheduled_at,
    };
  }

  async #submit(): Promise<void> {
    const errorEl = this.querySelector("#form-error");
    if (errorEl) {
      errorEl.textContent = "";
    }

    const input = this.#readInput();
    if (!input) {
      return;
    }

    try {
      if (this.#launchId && this.#launchId !== "new") {
        await updateLaunch(this.#launchId, input);
        showToast("Launch updated", "success");
      } else {
        await createLaunch(input);
        showToast("Launch scheduled", "success");
      }
      launchesStore.set(undefined);
      globalThis.location.assign("/launches");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save launch";
      if (errorEl) {
        errorEl.textContent = message;
      }
      showToast(message, "error");
    }
  }
}

customElements.define(tagName, LaunchFormPage);
