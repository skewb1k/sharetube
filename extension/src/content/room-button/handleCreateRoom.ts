import * as storage from "@/content/lib/storage";
import { setRoomURL } from "@/content/lib/url";
import { injectVideoInput } from "@/content/video-input";
import { createRoom, setClient, joinRoom, Client } from "@/content/lib/client";

export async function handleCreateRoom(): Promise<void> {
  const roomId = await createRoom();
  setRoomURL(roomId);

  const authToken = await joinRoom(roomId);
  storage.setRoomId(roomId);
  storage.setAuthToken(authToken);

  injectVideoInput();

  const newClient = new Client(authToken);
  newClient.subscribe();
  setClient(newClient);
}
