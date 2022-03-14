import ws from "ws";
import { v4 as uuidv4 } from "uuid";
import { handleRoom } from "./websocketHelpers";
import { wssrooms, MessageData } from "../types";

export default (expressServer: any) => {
  const websocketserver: any = new ws.Server({
    noServer: true,
    path: "/ws",
  });
  websocketserver.rooms = {};
  const wss = websocketserver as wssrooms;

  expressServer.on("upgrade", (request: any, socket: any, head: any) => {
    wss.handleUpgrade(request, socket, head, (websocket) => {
      wss.emit("connection", websocket, request);
    });
  });

  wss.on("connection", function connection(ws, connectionRequest) {
    const connectionUrl = connectionRequest?.url?.split("?");
    let path, params;
    if (connectionUrl) {
      path = connectionUrl[0];
      params = connectionUrl[1];
    }
    console.log({ path, params });
    const uuid = uuidv4();

    ws.on("message", function incoming(message) {
      const parsedData: MessageData = JSON.parse(message.toString());
      handleRoom(parsedData, wss, ws, uuid);
    });

    ws.on("close", function close(code, reason) {
      handleRoom({ meta: 'Leave'}, wss, ws, uuid);
    });
  });

  return wss;
};
