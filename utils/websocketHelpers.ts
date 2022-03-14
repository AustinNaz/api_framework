import ws from "ws";
import { wssrooms, MessageData } from "../types";

export const handleRoom = (
  parsedData: MessageData,
  ws: wssrooms,
  socket: ws,
  uuid: string
) => {
  if (!parsedData.meta) return null;

  if (parsedData.meta === "Join" && parsedData.room)
    joinRoom(parsedData.room, ws, socket, uuid);
  if (parsedData.meta === "Leave") leaveRoom(ws, uuid, parsedData.room);
  console.log("after", ws.rooms);
};

const joinRoom = (room: string, ws: wssrooms, socket: ws, uuid: string) => {
  if (!room) return;
  if (!ws.rooms[room]) ws.rooms[room] = { users: {} };

  ws.rooms[room].users[uuid] = socket;
  updateRoomUsers(room, ws);
};

const updateRoomUsers = (room: string, ws: wssrooms) => {
  const currDate = new Date();
  currDate.setMinutes(currDate.getMinutes() + 1);

  if (!Object.keys(ws.rooms[room].users).length) return delete ws.rooms[room];

  const data = {
    meta: "RoomUpdate",
    // Send update
  };

  Object.keys(ws.rooms[room].users).map((userId) => {
    console.log("emiting", userId);
    ws.rooms[room].users[userId].emit("RoomUpdate", data);
    ws.rooms[room].users[userId].send(JSON.stringify(data));
  });
};

const leaveRoom = (ws: wssrooms, uuid: string, room?: string) => {
  if (!room) {
    Object.keys(ws.rooms).forEach((id) => {
      if (ws.rooms[id].users[uuid]) {
        delete ws.rooms[id].users[uuid];
        updateRoomUsers(id, ws);
      }
    });
  } else {
    ws.rooms[room] || ws.rooms[room].users[uuid];
    delete ws.rooms[room].users[uuid];
    updateRoomUsers(room, ws);
  }
};
