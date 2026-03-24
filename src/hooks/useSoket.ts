import { useEffect, useRef } from "react";
import { socket } from "../socket";

export const useSocket = (event: string, callback: (data: any) => void) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (data: any) => {
      callbackRef.current(data); // Gọi callback ngay lập tức
    };

    // Đảm bảo socket đã kết nối
    if (!socket.connected) {
      socket.connect();
    }

    // Lắng nghe sự kiện
    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [event]);
};
