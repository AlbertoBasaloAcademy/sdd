import "../shared/components/page-header.component.js";
import { appTitle } from "../shared/global.js";
import { demoItems, subtitle } from "../shared/repositories/home.repository.js";
export const tagName = "ab-home-page";


class HomePage extends HTMLElement {
  public connectedCallback(): void {
    const itemLinks = demoItems
      .map(({ id, name }) => `<li><a href="/items/${id}">${name}</a></li>`)
      .join("");
    this.innerHTML = `
      <ab-page-header heading="${appTitle}" subtitle="${subtitle}"></ab-page-header>
      <section>
        <h2>Engineering</h2>
        <ul>${itemLinks}</ul>
      </section>`;
  }
}

customElements.define(tagName, HomePage);
