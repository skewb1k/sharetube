import { createSignal } from "solid-js";
import { injectVideoInput } from "../video-input";

const host = import.meta.env.VITE_ST_HOST || "http://localhost:9090";
export const STORAGE_KEY_ROOM_ID = "st-room-id";
export const STORAGE_KEY_AUTH_TOKEN = "st-auth-token";

export const [client, setClient] = createSignal<Client | undefined>();

export interface User {
  name: string;
}

export interface Room {
  users: User[];
}

export interface AddVideoRequest {
  ytId: string;
}

export async function createRoom(): Promise<string> {
  const response = await fetch(`${host}/room`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const roomId = await response.text();
  return roomId;
}

export async function getRoom(roomId: string): Promise<Room> {
  const response = await fetch(`${host}/room/${roomId}`);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const room = await response.json();
  return room;
}

export async function joinRoom(roomId: string): Promise<string> {
  const response = await fetch(`${host}/room/${roomId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // TODO(skewb1k): support providing params.
    body: "{}",
  });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const authToken = await response.text();
  return authToken;
}

export class Client {
  authToken: string;

  constructor(authToken: string) {
    this.authToken = authToken;
  }

  async addVideo(requestBody: AddVideoRequest): Promise<void> {
    const response = await fetch(`${host}/video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.authToken,
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
  }

  subscribe() {
    // TODO(skewb1k): un-hardcode host.
    let ws = new WebSocket(
      `ws://localhost:9090/subscribe?token=${this.authToken}`,
    );

    ws.addEventListener("open", () => {
      console.log("Connection open");
    });

    ws.addEventListener("message", (ev) => {
      console.log("New message", ev.data);
    });

    ws.addEventListener("close", () => {
      console.log("Connection closed");
    });

    ws.addEventListener("error", (ev) => {
      console.error("Connection error", ev);
    });
  }
}

export function parseRoomURL(url: string): string | null {
  // TODO(skewb1k): consider validating roomId.
  const inviteMatch = url.match(/\/sharetube\/([^/?#]+)/);
  if (inviteMatch) {
    return inviteMatch[1];
  }
  return null;
}

export function setRoomURL(roomId: string): void {
  const newPath = `/sharetube/${roomId}`;
  history.replaceState(null, "", newPath);
  console.log("URL set to %s", newPath);
}

export async function handleRoomURL(roomId: string): Promise<void> {
  let authToken: string;
  try {
    authToken = await joinRoom(roomId);
  } catch (err) {
    // TODO(skewb1k): display "Room Not Found" in case of error.
    console.error("Failed to join room:", err);
    return;
  }
  console.log("Joined room %s", roomId);

  localStorage.setItem(STORAGE_KEY_ROOM_ID, roomId);
  localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, authToken);
  // TODO(skewb1k): open current video URL if present.
  window.location.href = "/";
}

export async function handleStoredRoomId(roomId: string): Promise<void> {
  const authToken = localStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
  if (authToken === null) {
    throw new Error("Found stored room ID but missing auth token");
  }

  let room: Room;
  try {
    room = await getRoom(roomId);
  } catch (err) {
    setClient(undefined);
    localStorage.removeItem(STORAGE_KEY_ROOM_ID);
    localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
    console.log(
      "Failed to get room for stored ID %s; storage cleaned: %o",
      roomId,
      err,
    );
    return;
  }
  // TODO(skewb1k): YouTube can override URL back to '/', investigate how to
  // listen for such event and keep url updated.
  setRoomURL(roomId);
  console.log("Fetched room info for %s: %o", roomId, room);
  injectVideoInput();

  const newClient = new Client(authToken);
  newClient.subscribe();
  setClient(newClient);
}
