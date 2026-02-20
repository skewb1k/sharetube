import { createSignal } from "solid-js";

export const [client, setClient] = createSignal<Client | undefined>();

const host = import.meta.env.VITE_ST_HOST || "http://localhost:9090";

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
