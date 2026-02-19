import { render } from "solid-js/web";
import { waitElement } from "@/content/lib/waitElement";
import { VideoInput } from "./VideoInput";

export function injectVideoInput() {
  waitElement("#center").then((e) => {
    e.replaceChildren();
    render(() => <VideoInput />, e);
  });
}
