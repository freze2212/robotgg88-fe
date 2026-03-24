import { useState, useEffect } from "react";

/**
 * Chiều rộng viewport (cập nhật khi resize) — dùng cho layout responsive.
 * SSR/CRA: mặc định 1200 để tránh lệch hydration nhẹ; sau mount sẽ đúng ngay.
 */
export function useWindowWidth(): number {
  const [w, setW] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return w;
}
