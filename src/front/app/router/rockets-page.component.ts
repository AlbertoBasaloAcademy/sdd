import "../shared/components/page-header.component.js";
import { listRockets, type Rocket } from "../shared/repositories/rockets.repository.js";
import { rocketsStore } from "../shared/store/rockets.store.js";

export const tagName = "ab-rockets-page";

const statusLabel = (status: Rocket["status"]): string => {
  switch (status) {
    case "available":
      return "Available";
    case "maintenance":
      return "Maintenance";
    case "in_flight":
      return "In flight";
  }
};

class RocketsPage extends HTMLElement {
  public connectedCallback(): void {
    this.innerHTML = `
      <ab-page-header heading="Rocket Fleet" subtitle="Operational spacecraft in the AstroBookings fleet."></ab-page-header>
      <p><a href="/rockets/new">Add rocket</a></p>
      <p id="fleet-status">Loading fleet…</p>
      <ul id="fleet-list"></ul>`;

    const cached = rocketsStore.get();
    if (cached) {
      this.#renderFleet(cached);
    }
    this.#loadFleet().catch(() => undefined);
  }

  async #loadFleet(): Promise<void> {
    try {
      const rockets = await listRockets();
      rocketsStore.set(rockets);
      this.#renderFleet(rockets);
    } catch {
      const statusEl = this.querySelector("#fleet-status");
      if (statusEl) {
        statusEl.textContent = "Fleet unavailable.";
      }
    }
  }

  #renderFleet(rockets: Rocket[]): void {
    const statusEl = this.querySelector("#fleet-status");
    const listEl = this.querySelector("#fleet-list");
    if (!statusEl || !listEl) {
      return;
    }

    statusEl.textContent = `${rockets.length} rocket(s) in service.`;
    listEl.innerHTML = rockets
      .map(
        ({ id, name, model, capacity, status, range }) =>
          `<li><a href="/rockets/${id}">${name}</a> — ${model}, ${capacity} seats, ${statusLabel(status)}, ${range}</li>`,
      )
      .join("");
  }
}

customElements.define(tagName, RocketsPage);
