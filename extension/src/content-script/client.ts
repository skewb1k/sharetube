interface User {
  name: string;
}

interface Room {
  users: User[];
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
  });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const userId = await response.text();
  return userId;
}

function connectRoom(userId: string, roomId: string) {
  let ws = new WebSocket(
    `ws://localhost:9090/room/${roomId}/connect?uid=${userId}`,
  );

  ws.addEventListener("open", () => {
    console.log("Connection open");
  });

  ws.addEventListener("close", (ev) => {
    console.log("Connection closed");
  });

  ws.addEventListener("error", (ev) => {
    console.error("Connection error", ev);
  });
}
