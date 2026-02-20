import { Panel } from "./Panel";
import { render } from "solid-js/web";
import { waitElement } from "../lib/waitElement";

export function injectPanel() {
  waitElement("#secondary-inner").then((e) => {
    const wrapper = document.createElement("div");
    e.prepend(wrapper);
    render(() => <Panel />, wrapper);
  });
}
