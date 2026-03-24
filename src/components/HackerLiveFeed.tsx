import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "./HackerLiveFeed.css";

type FeedSide = "left" | "right";

type LiveHackLine = {
  user: string;
  action: string;
  table: string;
  tablePath: string;
};

const LIVE_HACK_LINES: LiveHackLine[] = [
  { user: "Xiaofeng", action: "vừa hack thành công", table: "BACCARAT C01", tablePath: "/casino/room/C01" },
  { user: "forg", action: "Đang truy cập", table: "BACCARAT C02", tablePath: "/casino/room/C02" },
  { user: "onestar", action: "phân tích thành công", table: "BACCARAT C02", tablePath: "/casino/room/C02" },
  { user: "user001", action: "Đã kết nối thành công", table: "BACCARAT C02", tablePath: "/casino/room/C02" },
  { user: "neo_hack", action: "đồng bộ tín hiệu AI", table: "BACCARAT C04", tablePath: "/casino/room/C04" },
  { user: "delta99", action: "vừa hack thành công", table: "BACCARAT C03", tablePath: "/casino/room/C03" },
  { user: "ghost_x", action: "Đang truy cập", table: "BACCARAT C05", tablePath: "/casino/room/C05" },
];

type TerminalLine = {
  time: string;
  tag: "ok" | "banker" | "player";
  tagText: string;
  body: string;
  table?: string;
  tablePath?: string;
};

const TERMINAL_LINES: TerminalLine[] = [
  { time: "22:12:11", tag: "ok", tagText: "TÍN HIỆU ỔN ĐỊNH", body: "— kênh dự đoán hoạt động bình thường tại", table: "BÀN BACCARAT C03", tablePath: "/casino/room/C03" },
  { time: "22:11:58", tag: "banker", tagText: "PHÁT HIỆN CHUỖI", body: "chuỗi BANKER tại", table: "BÀN BACCARAT C01", tablePath: "/casino/room/C01" },
  { time: "22:11:42", tag: "player", tagText: "PHÁT HIỆN CHUỖI", body: "chuỗi PLAYER tại", table: "BÀN BACCARAT C04", tablePath: "/casino/room/C04" },
  { time: "22:11:30", tag: "ok", tagText: "TÍN HIỆU ỔN ĐỊNH", body: "Latency ASIA_SEXY_V1 < 120ms." },
  { time: "22:11:05", tag: "banker", tagText: "CẢNH BÁO", body: "Biến động BANKER — theo dõi", table: "BÀN BACCARAT C02", tablePath: "/casino/room/C02" },
  { time: "22:10:51", tag: "player", tagText: "PHÂN TÍCH", body: "Ưu tiên PLAYER tại", table: "BÀN BACCARAT C05", tablePath: "/casino/room/C05" },
];

function LiveHackBlock() {
  return (
    <div className="hacker-feed__block" aria-hidden>
      {LIVE_HACK_LINES.map((line, i) => (
        <div className="hacker-feed__line hacker-feed__line--live" key={`a-${i}`}>
          <span className="hacker-feed__prompt">&gt;&gt;</span>{" "}
          <span className="hacker-feed__user">{line.user}</span>{" "}
          <span className="hacker-feed__msg">{line.action}</span>{" "}
          <Link className="hacker-feed__room" to={line.tablePath}>
            {line.table}
          </Link>
        </div>
      ))}
    </div>
  );
}

function TerminalBlock() {
  return (
    <div className="hacker-feed__block" aria-hidden>
      {TERMINAL_LINES.map((line, i) => (
        <div className="hacker-feed__line hacker-feed__line--term" key={`t-${i}`}>
          <span className="hacker-feed__time">[{line.time}]</span>{" "}
          <span className={`hacker-feed__tag hacker-feed__tag--${line.tag}`}>
            {line.tagText}
          </span>{" "}
          <span className="hacker-feed__body">{line.body}</span>
          {line.table && line.tablePath ? (
            <>
              {" "}
              <Link className="hacker-feed__link-table" to={line.tablePath}>
                {line.table}
              </Link>
              .
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
}

type HackerLiveFeedProps = {
  side: FeedSide;
  variant: "live" | "terminal";
};

/**
 * Popup tin tức kiểu terminal / hacker — cuộn dọc vô hạn.
 * Đặt fixed góc dưới trái (live) hoặc phải (terminal).
 */
const HackerLiveFeed: React.FC<HackerLiveFeedProps> = ({ side, variant }) => {
  const title = variant === "live" ? "LIVE HACK ONLINE" : "TERMINAL";
  const durationSec = variant === "live" ? 42 : 48;

  const content = useMemo(
    () =>
      variant === "live" ? (
        <>
          <LiveHackBlock />
          <LiveHackBlock />
        </>
      ) : (
        <>
          <TerminalBlock />
          <TerminalBlock />
        </>
      ),
    [variant]
  );

  return (
    <aside
      className={`hacker-feed hacker-feed--${side} hacker-feed--${variant}`}
      aria-label={variant === "live" ? "Luồng live hack" : "Luồng terminal hệ thống"}
    >
      <div className="hacker-feed__chrome">
        <header className="hacker-feed__head">
          <span className="hacker-feed__corner hacker-feed__corner--tl" aria-hidden />
          <span className="hacker-feed__corner hacker-feed__corner--tr" aria-hidden />
          <h2 className="hacker-feed__title">{title}</h2>
          <span
            className="hacker-feed__live-dot"
            title="Đang phát sóng"
            aria-hidden
          />
        </header>
        <div className="hacker-feed__viewport">
          <div
            className="hacker-feed__track"
            style={{ animationDuration: `${durationSec}s` }}
          >
            {content}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default HackerLiveFeed;
