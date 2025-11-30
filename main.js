import { renderHeader } from "./header.js";
import { renderNav } from "./nav.js";

export function loadLayout(activePage) {
  renderHeader();
  renderNav(activePage);
}
