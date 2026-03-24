/**
 * URL ảnh/tài nguyên trong public/assets.
 * Dev: thêm ?v=timestamp (mỗi F5 đổi) → thay file ảnh + F5 là thấy ngay, không bị cache.
 * Production: không thêm ?v → cache bình thường.
 */
export function getAssetUrl(path: string): string {
  if (process.env.NODE_ENV !== "development") return path;
  const v = typeof window !== "undefined" ? window.__ASSET_V__ ?? Date.now() : "";
  return v ? `${path}?v=${v}` : path;
}
