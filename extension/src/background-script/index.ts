async function createRoom(): Promise<string> {
  const response = await fetch("$ST_HOST/room", {
    method: "POST",
  });
  const roomId = response.text();
  return roomId;
}

async function handleMessage(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
) {
  switch (message.method) {
    case "createRoom":
      const roomId = await createRoom();
      sendResponse(roomId);
      return true;
    default:
      throw new Error(`Unknown method: ${message.method}`);
  }
}

chrome.runtime.onMessage.addListener(handleMessage);
