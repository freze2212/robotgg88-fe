import React from "react";

/**
 * Video nền toàn màn hình: PC dùng bg-pc.mp4, mobile dùng bg-mb.mp4
 */
const BackgroundVideo: React.FC = () => {
  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <video
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/assets/bg-mb.mp4" type="video/mp4" media="(max-width: 768px)" />
        <source src="/assets/bg-pc.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default BackgroundVideo;
