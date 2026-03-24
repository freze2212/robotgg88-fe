import React from "react";
import "./HomeMarquee.css";

export const DEFAULT_MARQUEE_LINES = [
  "Chúc mừng quỳnh***21 vừa rút thành công 15.000.000đ về MBBank",
  "Chúc mừng thành viên ***88 nhận thưởng khủng tại sảnh GG88",
  "Hệ thống cập nhật tỷ lệ dự đoán real-time — an toàn & minh bạch",
];

type HomeMarqueeProps = {
  /** Mặc định dùng DEFAULT_MARQUEE_LINES */
  lines?: string[];
  /** Bớt margin dưới (vd: trang casino) */
  className?: string;
};

/**
 * Marquee dưới header — dùng chung Home + Casino lobby.
 */
const HomeMarquee: React.FC<HomeMarqueeProps> = ({
  lines = DEFAULT_MARQUEE_LINES,
  className = "",
}) => {
  const marqueeLine = lines.join("   •   ");

  return (
    <div
      className={`home-marquee ${className}`.trim()}
      aria-label="Thông báo"
    >
      <div className="home-marquee__track">
        <span className="home-marquee__text">
          <span className="home-marquee__horn" role="img" aria-hidden>
            📢
          </span>
          {marqueeLine}
        </span>
        <span className="home-marquee__text" aria-hidden>
          <span className="home-marquee__horn">📢</span>
          {marqueeLine}
        </span>
      </div>
    </div>
  );
};

export default HomeMarquee;
