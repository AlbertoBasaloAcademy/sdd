import "../shared/components/page-header.component.js";
import { getRocket, type Rocket } from "../shared/repositories/rockets.repository.js";

export const tagName = "ab-rocket-detail-page";

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

class RocketDetailPage extends HTMLElement {
  public connectedCallback(): void {
    const id = this.getAttribute("rocket-id") ?? "unknown";
    this.innerHTML = `
      <ab-page-header heading="Rocket" subtitle="Fleet record"></ab-page-header>
      <p id="rocket-status">Loading rocket…</p>
      <dl id="rocket-details" hidden></dl>
      <p><a href="/rockets">← Back to fleet</a></p>`;

    this.#loadRocket(id).catch(() => undefined);
  }

  async #loadRocket(id: string): Promise<void> {
    const statusEl = this.querySelector("#rocket-status");
    const detailsEl = this.querySelector("#rocket-details");
    if (!statusEl || !detailsEl) {
      return;
    }

    try {
      const rocket = await getRocket(id);
      this.#renderRocket(rocket);
    } catch {
      statusEl.textContent = `Rocket #${id} not found.`;
    }
  }

  #renderRocket({ id, name, model, capacity, status, range }: Rocket): void {
    this.innerHTML = `
      <ab-page-header heading="${name}" subtitle="Fleet record"></ab-page-header>
      <p id="rocket-status">${name} is currently ${statusLabel(status).toLowerCase()}.</p>
      <dl id="rocket-details">
        <dt>Model</dt><dd>${model}</dd>
        <dt>Capacity</dt><dd>${capacity} passengers</dd>
        <dt>Status</dt><dd>${statusLabel(status)}</dd>
        <dt>Range</dt><dd>${range}</dd>
      </dl>
      <p><a href="/rockets/${id}/edit">Edit rocket</a></p>
      <p><a href="/rockets">← Back to fleet</a></p>`;
  }
}

customElements.define(tagName, RocketDetailPage);
