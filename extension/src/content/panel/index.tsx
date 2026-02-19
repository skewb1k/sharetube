import { Panel } from "./Panel";
import { waitElement } from "../lib/waitElement";
import { render } from "solid-js/web";

export function injectPanel() {
  waitElement("#secondary-inner").then((e) => {
    const wrapper = document.createElement("div");
    e.prepend(wrapper);
    render(() => <Panel />, wrapper);
  });
}
