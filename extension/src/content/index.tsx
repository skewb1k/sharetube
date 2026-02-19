import "./index.css";
import {
  parseRoomURL,
  handleRoomURL,
  handleStoredRoomId,
  STORAGE_KEY_ROOM_ID,
} from "./lib/client";
import { injectPanel } from "./panel";
import { injectRoomButton } from "./room-button";

injectPanel();

(async () => {
  console.log("Current URL:", location.href);
  const roomId = parseRoomURL(location.href);
  if (roomId !== null) {
    console.log("Room URL detected, room ID: %s", roomId);
    await handleRoomURL(roomId);
    return;
  }

  injectRoomButton();

  const storedRoomId = localStorage.getItem(STORAGE_KEY_ROOM_ID);
  if (storedRoomId !== null) {
    console.log("Found stored room ID: %s", storedRoomId);
    handleStoredRoomId(storedRoomId);
  }
})();
