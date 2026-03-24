import { io, Socket } from "socket.io-client";

// const URL = process.env.REACT_APP_URL_API_SOCKET;

export const socket: Socket = io("/data/data.json", {
  transports: ["websocket"],
  autoConnect: true,
});
