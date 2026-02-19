import {
  setClient,
  Client,
  joinRoom,
  createRoom,
  STORAGE_KEY_ROOM_ID,
  STORAGE_KEY_AUTH_TOKEN,
  setRoomURL,
} from "../lib/client";
import { injectVideoInput } from "../video-input";

export async function handleCreateRoom(): Promise<void> {
  const storedRoomId = localStorage.getItem(STORAGE_KEY_ROOM_ID);
  if (storedRoomId !== null) {
    throw new Error(
      `Expected stored room ID to be empty, found ${storedRoomId}`,
    );
  }
  const roomId = await createRoom();
  setRoomURL(roomId);

  const authToken = await joinRoom(roomId);
  localStorage.setItem(STORAGE_KEY_ROOM_ID, roomId);
  localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, authToken);

  // TODO(skewb1k): rename "Create Room" button.

  injectVideoInput();

  const newClient = new Client(authToken);
  newClient.subscribe();
  setClient(newClient);
}
