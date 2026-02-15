interface User {
  name: string;
}

interface Room {
  users: User[];
}

interface JoinRoomResp {
  user_id: number;
  room: Room;
}

async function createRoom(): Promise<string> {
  const response = await fetch("$ST_HOST/room", {
    method: "POST",
  });
  const roomId = response.text();
  return roomId;
}

async function joinRoom(roomId: string): Promise<JoinRoomResp> {
  const response = await fetch(`$ST_HOST/room/${roomId}`, {
    method: "POST",
  });
  const body = await response.json();
  return body;
}

function connectRoom(userId: number, roomId: string) {
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
