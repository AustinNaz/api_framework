import ws from 'ws'

export type wssrooms = {
  rooms: {
    [room: string]: {
      users: {
        [uuid: string]: ws
      }
    }
  };
} & ws.Server;

export type MessageData = {
  meta: "Join" | "Leave";
  room?: string;
};