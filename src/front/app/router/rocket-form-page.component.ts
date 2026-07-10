import "../shared/components/page-header.component.js";
import {
  ROCKET_RANGES,
  ROCKET_STATUSES,
  createRocket,
  listRockets,
  updateRocket,
  type Rocket,
  type RocketInput,
} from "../shared/repositories/rockets.repository.js";
import { rocketsStore } from "../shared/store/rockets.store.js";
import { showToast } from "../shared/toast.js";

export const tagName = "ab-rocket-form-page";

const rangeOptions = ROCKET_RANGES.map(
  (range) => `<option value="${range}">${range}</option>`,
).join("");

const statusOptions = ROCKET_STATUSES.map(
  (status) => `<option value="${status}">${status}</option>`,
).join("");

class RocketFormPage extends HTMLElement {
  #rocketId: string | undefined;

  public connectedCallback(): void {
    this.#rocketId = this.getAttribute("rocket-id") ?? undefined;
    const isEdit = this.#rocketId !== undefined && this.#rocketId !== "new";

    this.innerHTML = `
      <ab-page-header
        heading="${isEdit ? "Edit rocket" : "Add rocket"}"
        subtitle="Enter rocket details for the fleet.">
      </ab-page-header>
      <form id="rocket-form">
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Serial number
          <input name="serial_number" required />
        </label>
        <label>
          Capacity (1–9)
          <input name="capacity" type="number" min="1" max="9" required />
        </label>
        <label>
          Range
          <select name="range" required>${rangeOptions}</select>
        </label>
        <label>
          Status
          <select name="status" required>${statusOptions}</select>
        </label>
        <p id="form-error" role="alert"></p>
        <button type="submit">${isEdit ? "Save changes" : "Add rocket"}</button>
        <a href="/">Cancel</a>
      </form>`;

    this.querySelector("#rocket-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.#submit();
    });

    if (isEdit && this.#rocketId) {
      void this.#loadRocket(this.#rocketId);
    }
  }

  async #loadRocket(id: string): Promise<void> {
    const cached = rocketsStore.get()?.find((rocket) => rocket.id === id);
    const rocket = cached ?? (await listRockets()).find((item) => item.id === id);
    if (!rocket) {
      showToast("Rocket not found", "error");
      globalThis.location.assign("/");
      return;
    }
    this.#fillForm(rocket);
  }

  #fillForm(rocket: Rocket): void {
    const form = this.querySelector<HTMLFormElement>("#rocket-form");
    if (!form) {
      return;
    }
    (form.elements.namedItem("name") as HTMLInputElement).value = rocket.name;
    (form.elements.namedItem("serial_number") as HTMLInputElement).value = rocket.serial_number;
    (form.elements.namedItem("capacity") as HTMLInputElement).value = String(rocket.capacity);
    (form.elements.namedItem("range") as HTMLSelectElement).value = rocket.range;
    (form.elements.namedItem("status") as HTMLSelectElement).value = rocket.status;
  }

  #readInput(): RocketInput | undefined {
    const form = this.querySelector<HTMLFormElement>("#rocket-form");
    if (!form) {
      return undefined;
    }
    const capacity = Number((form.elements.namedItem("capacity") as HTMLInputElement).value);
    return {
      capacity,
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      range: (form.elements.namedItem("range") as HTMLSelectElement)
        .value as RocketInput["range"],
      serial_number: (form.elements.namedItem("serial_number") as HTMLInputElement).value,
      status: (form.elements.namedItem("status") as HTMLSelectElement)
        .value as RocketInput["status"],
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
      if (this.#rocketId && this.#rocketId !== "new") {
        await updateRocket(this.#rocketId, input);
        showToast("Rocket updated", "success");
      } else {
        await createRocket(input);
        showToast("Rocket added to the fleet", "success");
      }
      rocketsStore.set(undefined);
      globalThis.location.assign("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save rocket";
      if (errorEl) {
        errorEl.textContent = message;
      }
      showToast(message, "error");
    }
  }
}

customElements.define(tagName, RocketFormPage);
