import "../shared/components/page-header.component.js";
import { appTitle } from "../shared/global.js";
import {
  deactivateRocket,
  listRockets,
  type Rocket,
} from "../shared/repositories/rockets.repository.js";
import { rocketsStore } from "../shared/store/rockets.store.js";
import { showToast } from "../shared/toast.js";

export const tagName = "ab-home-page";

class HomePage extends HTMLElement {
  public connectedCallback(): void {
    this.innerHTML = `
      <ab-page-header heading="${appTitle}" subtitle="Rocket fleet overview"></ab-page-header>
      <section class="fleet-section">
        <header class="fleet-toolbar">
          <div>
            <h2>Rocket Fleet</h2>
            <p id="fleet-status" aria-live="polite">Loading fleet…</p>
          </div>
          <a href="/rockets/new" role="button" class="btn-sm">Add rocket</a>
        </header>
        <div class="fleet-table-wrap">
          <table id="fleet-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Serial</th>
                <th scope="col">Capacity</th>
                <th scope="col">Range</th>
                <th scope="col">Status</th>
                <th scope="col" class="fleet-actions-heading">Actions</th>
              </tr>
            </thead>
            <tbody id="fleet-list"></tbody>
          </table>
        </div>
      </section>`;

    const cached = rocketsStore.get();
    if (cached) {
      this.#renderFleet(cached);
    }
    void this.#loadFleet();
  }

  async #loadFleet(): Promise<void> {
    try {
      const rockets = await listRockets();
      rocketsStore.set(rockets);
      this.#renderFleet(rockets);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load rockets";
      this.querySelector("#fleet-status")!.textContent = message;
      showToast(message, "error");
    }
  }

  #renderFleet(rockets: Rocket[]): void {
    const statusEl = this.querySelector("#fleet-status");
    const listEl = this.querySelector("#fleet-list");
    if (!statusEl || !listEl) {
      return;
    }

    statusEl.textContent = `${rockets.length} rocket(s) in the fleet.`;

    if (rockets.length === 0) {
      listEl.innerHTML = `
        <tr>
          <td colspan="6" class="fleet-empty">No rockets in the fleet yet.</td>
        </tr>`;
      return;
    }

    listEl.innerHTML = rockets
      .map(
        ({ capacity, id, name, range, serial_number, status }) => `
          <tr>
            <th scope="row">${name}</th>
            <td><code>${serial_number}</code></td>
            <td>${capacity}</td>
            <td>${range}</td>
            <td><span class="fleet-status fleet-status-${status.toLowerCase()}">${status}</span></td>
            <td class="fleet-actions">
              <a href="/rockets/${id}/edit" role="button" class="secondary outline btn-sm">Edit</a>
              <button type="button" class="secondary outline btn-sm" data-deactivate="${id}" data-name="${name}">Deactivate</button>
            </td>
          </tr>`,
      )
      .join("");

    listEl.querySelectorAll<HTMLButtonElement>("[data-deactivate]").forEach((button) => {
      button.addEventListener("click", () => {
        void this.#deactivate(button.dataset["deactivate"] ?? "", button.dataset["name"] ?? "rocket");
      });
    });
  }

  async #deactivate(id: string, name: string): Promise<void> {
    if (!id) {
      showToast("Invalid rocket id", "error");
      return;
    }
    if (!globalThis.confirm(`Deactivate ${name} and remove it from the fleet?`)) {
      return;
    }
    try {
      await deactivateRocket(id);
      showToast(`${name} deactivated`, "success");
      await this.#loadFleet();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to deactivate rocket";
      showToast(message, "error");
    }
  }
}

customElements.define(tagName, HomePage);
