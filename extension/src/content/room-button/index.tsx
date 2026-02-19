import { render } from "solid-js/web";
import { waitElement } from "@/content/lib/waitElement";
import { RoomButton } from "./RoomButton";

export function injectRoomButton() {
  waitElement("#end").then((e) => {
    const wrapper = document.createElement("div");
    e.prepend(wrapper);
    render(() => <RoomButton />, wrapper);
  });
}
