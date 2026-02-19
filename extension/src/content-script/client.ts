interface User {
  name: string;
}

interface Room {
  users: User[];
}

interface AddVideoRequest {
  ytId: string;
}

async function createRoom(): Promise<string> {
  const response = await fetch("$ST_HOST/room", {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const roomId = await response.text();
  return roomId;
}

async function getRoom(roomId: string): Promise<Room> {
  const response = await fetch(`$ST_HOST/room/${roomId}`);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const room = await response.json();
  return room;
}

async function joinRoom(roomId: string): Promise<string> {
  const response = await fetch(`$ST_HOST/room/${roomId}`, {
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

class Client {
  authToken: string;

  constructor(authToken: string) {
    this.authToken = authToken;
  }

  async addVideo(requestBody: AddVideoRequest): Promise<void> {
    const response = await fetch(`$ST_HOST/video`, {
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

    ws.addEventListener("close", (ev) => {
      console.log("Connection closed");
    });

    ws.addEventListener("error", (ev) => {
      console.error("Connection error", ev);
    });
  }
}
