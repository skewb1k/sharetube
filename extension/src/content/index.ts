import "./index.css";
import * as storage from "./lib/storage";
import { type Room, getRoom, joinRoom, setClient, Client } from "./lib/client";
import { injectPanel } from "./panel";
import { injectRoomButton } from "./room-button";
import { injectVideoInput } from "./video-input";
import { parseRoomURL, setRoomURL } from "./lib/url";

async function acceptInvite(roomId: string): Promise<void> {
  let authToken: string;
  try {
    authToken = await joinRoom(roomId);
  } catch (err) {
    // TODO(skewb1k): display "Room Not Found" in case of error.
    console.error("Failed to join room:", err);
    return;
  }
  console.log("Joined room ", roomId);

  storage.setRoomId(roomId);
  storage.setAuthToken(authToken);
  // TODO(skewb1k): open current video URL if present.
  window.location.href = "/";
}

async function joinStoredRoom(roomId: string): Promise<void> {
  const authToken = storage.getAuthToken();

  let room: Room;
  try {
    room = await getRoom(roomId);
  } catch (err) {
    setClient(undefined);
    storage.removeAuthToken();
    storage.removeRoomId();
    console.log(
      "Failed to get room for stored ID %s; storage cleaned: %o",
      roomId,
      err,
    );
    return;
  }
  setRoomURL(roomId);
  console.log("Fetched room info for %s: %o", roomId, room);
  injectVideoInput();

  const newClient = new Client(authToken);
  newClient.subscribe();
  setClient(newClient);
}

(async () => {
  console.log("Current URL:", location.href);
  const roomId = parseRoomURL(location.href);
  if (roomId !== null) {
    console.log("Room URL detected, room ID: %s", roomId);
    await acceptInvite(roomId);
    return;
  }

  injectPanel();
  injectRoomButton();

  try {
    const storedRoomId = storage.getRoomId();
    console.log("Found stored room ID: %s", storedRoomId);
    await joinStoredRoom(storedRoomId);
  } catch {}
})();
