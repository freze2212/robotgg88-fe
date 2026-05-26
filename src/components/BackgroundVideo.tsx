import React from "react";

const BG_PC_URL = `${process.env.PUBLIC_URL || ""}/assets/bg-pc.png`;

/**
 * Nền toàn màn hình: dùng ảnh bg-pc.png (class bg-pc)
 */
const BackgroundVideo: React.FC = () => {
  return (
    <div
      className="bg-pc"
      style={{ backgroundImage: `url(${BG_PC_URL})` }}
      aria-hidden
    />
  );
};

export default BackgroundVideo;
