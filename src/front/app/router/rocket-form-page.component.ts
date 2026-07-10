import "../shared/components/page-header.component.js";
import {
  createRocket,
  getRocket,
  MAX_CAPACITY,
  ROCKET_RANGES,
  ROCKET_STATUSES,
  updateRocket,
  type Rocket,
  type RocketInput,
  type RocketRange,
  type RocketStatus,
} from "../shared/repositories/rockets.repository.js";
import { rocketsStore } from "../shared/store/rockets.store.js";

export const tagName = "ab-rocket-form-page";

const rangeOptions = ROCKET_RANGES.map((range) => `<option value="${range}">${range}</option>`).join(
  "",
);

const statusOptions = ROCKET_STATUSES.map(
  (status) => `<option value="${status}">${status.replace("_", " ")}</option>`,
).join("");

class RocketFormPage extends HTMLElement {
  #rocketId: string | undefined;

  public connectedCallback(): void {
    this.#rocketId = this.getAttribute("rocket-id") ?? undefined;
    const isEdit = Boolean(this.#rocketId);

    this.innerHTML = `
      <ab-page-header heading="${isEdit ? "Edit Rocket" : "New Rocket"}" subtitle="Fleet management form"></ab-page-header>
      <form id="rocket-form">
        <label for="name">Name</label>
        <input id="name" name="name" required />

        <label for="model">Model</label>
        <input id="model" name="model" required />

        <label for="capacity">Capacity</label>
        <input id="capacity" name="capacity" type="number" min="0" max="${MAX_CAPACITY - 1}" required />

        <label for="status">Status</label>
        <select id="status" name="status" required>${statusOptions}</select>

        <label for="range">Range</label>
        <select id="range" name="range" required>${rangeOptions}</select>

        <p id="form-error" role="alert" hidden></p>
        <button type="submit">${isEdit ? "Save changes" : "Create rocket"}</button>
      </form>
      <p><a href="${isEdit ? `/rockets/${this.#rocketId}` : "/rockets"}">← Cancel</a></p>`;

    this.querySelector("#rocket-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      this.#handleSubmit().catch(() => undefined);
    });

    if (isEdit && this.#rocketId) {
      this.#loadRocket(this.#rocketId).catch(() => undefined);
    }
  }

  async #loadRocket(id: string): Promise<void> {
    try {
      const rocket = await getRocket(id);
      this.#fillForm(rocket);
    } catch {
      this.#showError(`Rocket #${id} not found.`);
    }
  }

  #fillForm({ name, model, capacity, status, range }: Rocket): void {
    const form = this.querySelector("#rocket-form");
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    (form.elements.namedItem("name") as HTMLInputElement).value = name;
    (form.elements.namedItem("model") as HTMLInputElement).value = model;
    (form.elements.namedItem("capacity") as HTMLInputElement).value = String(capacity);
    (form.elements.namedItem("status") as HTMLSelectElement).value = status;
    (form.elements.namedItem("range") as HTMLSelectElement).value = range;
  }

  async #handleSubmit(): Promise<void> {
    const form = this.querySelector("#rocket-form");
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const input = this.#readForm(form);
    if (!input) {
      return;
    }

    this.#showError("");

    try {
      const rocket = this.#rocketId
        ? await updateRocket(this.#rocketId, input)
        : await createRocket(input);
      rocketsStore.set(undefined);
      globalThis.location.href = `/rockets/${rocket.id}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save rocket.";
      this.#showError(message.replace(/^POST .* failed: \d+ /, "").replace(/^PUT .* failed: \d+ /, ""));
    }
  }

  #readForm(form: HTMLFormElement): RocketInput | undefined {
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const model = (form.elements.namedItem("model") as HTMLInputElement).value.trim();
    const capacity = Number((form.elements.namedItem("capacity") as HTMLInputElement).value);
    const status = (form.elements.namedItem("status") as HTMLSelectElement).value as RocketStatus;
    const range = (form.elements.namedItem("range") as HTMLSelectElement).value as RocketRange;

    if (!name || !model) {
      this.#showError("Name and model are required.");
      return undefined;
    }
    if (!Number.isInteger(capacity) || capacity < 0 || capacity >= MAX_CAPACITY) {
      this.#showError(`Capacity must be below ${MAX_CAPACITY}.`);
      return undefined;
    }

    return { capacity, model, name, range, status };
  }

  #showError(message: string): void {
    const errorEl = this.querySelector("#form-error");
    if (!(errorEl instanceof HTMLElement)) {
      return;
    }
    if (message) {
      errorEl.textContent = message;
      errorEl.removeAttribute("hidden");
      return;
    }
    errorEl.textContent = "";
    errorEl.setAttribute("hidden", "");
  }
}

customElements.define(tagName, RocketFormPage);
