import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWindowWidth } from "../../hooks/useWindowWidth";
import { getAssetUrl } from "../../utils/assetUrl";
import "../hompage/HomePage.css";
import "./HomeNH.css";
import "../../components/FramePopupPanel.css";
import "./TableGameResult.css";

const LOGIN_PREFIXES = [
  "iron", "slot", "zeus", "neo", "ghost", "king", "vip", "max", "pro", "win", "bet", "ace",
];

function buildLoginFeedLines(count: number): string[] {
  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    const prefix = LOGIN_PREFIXES[Math.floor(Math.random() * LOGIN_PREFIXES.length)];
    lines.push(`${prefix}${Math.floor(Math.random() * 900) + 100}`);
  }
  return lines;
}

const featureBtnBase: React.CSSProperties = {
  height: 82,
  border: "1px solid #ffcc00",
  borderRadius: 10,
  background: "linear-gradient(180deg, #e5b84a 0%, #b47f00 55%, #8a5e00 100%)",
  boxShadow: "0 0 12px rgba(255, 179, 0, 0.15)",
  textAlign: "center",
  boxSizing: "border-box",
};

const vipFeatureBtnBase: React.CSSProperties = {
  ...featureBtnBase,
  background: "linear-gradient(180deg, #d44a4a 0%, #8b1515 55%, #5a0a0a 100%)",
  border: "1px solid #ff6b6b",
  boxShadow: "0 0 12px rgba(255, 68, 0, 0.2)",
};

export type TableGameResultLayoutProps = {
  gameTitle: string;
  gameImg: string;
  winPercent: number;
  manualValues: { rounds: number; minBet: string };
  autoValues: { rounds: number; minBet: string };
  timeSlotText: string;
  vipHackActive: boolean;
  vipHackUiVisible: boolean;
  vipHackRemainingSec: number;
  isVipHackPopupStarting: boolean;
  isVipFeatureCharging: boolean;
  isHackPopupOpen: boolean;
  hackPopupMode: "input" | "loading";
  hackProgress: number;
  hackCapitalLabel: string;
  isSpinning: boolean;
  isHackBtnHovered: boolean;
  setIsHackBtnHovered: (v: boolean) => void;
  openHackPopup: () => void;
  handleVipFeatureClick: () => void;
  stopVipHackNow: () => void;
  formatMMSS: (sec: number) => string;
};

const TableGameResultLayout: React.FC<TableGameResultLayoutProps> = ({
  gameTitle,
  gameImg,
  winPercent,
  manualValues,
  autoValues,
  timeSlotText,
  vipHackActive,
  vipHackUiVisible,
  vipHackRemainingSec,
  isVipHackPopupStarting,
  isVipFeatureCharging,
  isHackPopupOpen,
  hackPopupMode,
  hackProgress,
  hackCapitalLabel,
  isSpinning,
  isHackBtnHovered,
  setIsHackBtnHovered,
  openHackPopup,
  handleVipFeatureClick,
  stopVipHackNow,
  formatMMSS,
}) => {
  const navigate = useNavigate();
  const ww = useWindowWidth();
  const isNarrow = ww <= 480;

  const statusLines = useMemo(() => {
    const lines = buildLoginFeedLines(14);
    return [...lines, ...lines];
  }, []);

  const showScanVip = vipHackActive || vipHackUiVisible;

  return (
    <div className="result-page slot-lobby-page">
      <button
        type="button"
        className="slot-lobby-back result-page__back"
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/NH"))}
        aria-label="Quay lại"
      >
        <span className="slot-lobby-back__chevrons" aria-hidden>
          &laquo;&laquo;
        </span>
        BACK
      </button>

      <div className="result-page__grid">
        <aside className="home-panel result-page__side">
          <h2 className="home-panel__head">HƯỚNG DẪN &amp; VIP</h2>
          <div className="home-panel__body">
            <h3 className="home-panel__section-title">HƯỚNG DẪN ĐĂNG KÝ</h3>
            <ol className="home-panel__steps">
              <li>Truy cập trang chủ GG88 và chọn mục Đăng ký tài khoản mới.</li>
              <li>Điền đầy đủ thông tin, xác minh số điện thoại và hoàn tất đăng ký.</li>
            </ol>
            <h3 className="home-panel__section-title">NÂNG CẤP VIP MEMBER</h3>
            <p className="home-panel__text">
              Trở thành VIP để nhận ưu đãi nạp, hoàn trả và hỗ trợ kỹ thuật ưu tiên khi sử dụng tool dự đoán GG88.
            </p>
            <div className="home-panel__vip-box">
              <p>
                <strong>Nạp tích lũy tối thiểu 3,000,000 VNĐ</strong> để được xét duyệt nâng hạng VIP Member.
              </p>
            </div>
            <button type="button" className="home-panel__btn" onClick={() => navigate("/casino/lobby")}>
              KẾT NỐI NGAY
            </button>
          </div>
        </aside>

        <div
          className="result-modal"
          style={{ backgroundImage: `url(${getAssetUrl("/assets/frame-modal.png")})` }}
        >
          <div className="result-modal__body">
          {/* Percent (trái) + Robot (phải) */}
          <div
            className="result-modal__hero"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: isNarrow ? 8 : 12,
              marginTop: 8,
            }}
          >
            <div
              className="result-modal__percent"
              style={{
                position: "relative",
                flexShrink: 0,
                width: isNarrow ? 100 : 120,
                height: isNarrow ? 100 : 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={getAssetUrl("/assets/percent.gif")}
                alt=""
                aria-hidden
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Roboto, Arial, sans-serif",
                  fontWeight: 900,
                  fontSize: isNarrow ? 24 : 28,
                  color: "#fff",
                  textShadow: "0 0 12px rgba(0, 0, 0, 0.8)",
                  pointerEvents: "none",
                }}
              >
                {winPercent}%
              </span>
            </div>
            <img
              src={getAssetUrl("/assets/robot.gif")}
              alt="robot"
              style={{
                width: isNarrow ? "min(260px, calc(100% - 108px))" : "min(320px, calc(100% - 132px))",
                height: "auto",
                maxHeight: isNarrow ? 200 : 255,
                objectFit: "contain",
                flexShrink: 1,
              }}
            />
          </div>

          {/* Game + scan — layout cũ */}
          <div
            style={{
              display: "flex",
              flexDirection: isNarrow ? "column" : "row",
              gap: isNarrow ? 10 : 12,
              marginTop: -4,
              alignItems: isNarrow ? "stretch" : "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                width: isNarrow ? "100%" : "auto",
              }}
            >
              <img
                src={gameImg}
                alt="game"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getAssetUrl("/assets/nohu.gif");
                }}
                style={{
                  width: isNarrow ? 120 : 132,
                  height: isNarrow ? 120 : 132,
                  minWidth: isNarrow ? undefined : 132,
                  borderRadius: 12,
                  objectFit: "cover",
                  border: "2px solid #ff3b30",
                }}
              />
              {isNarrow ? (
                <div
                  style={{
                    fontFamily: "Roboto, sans-serif",
                    fontSize: "clamp(1rem, 4.5vw, 1.45rem)",
                    fontWeight: 900,
                    lineHeight: 1.15,
                    marginTop: 8,
                    textAlign: "center",
                    maxWidth: "100%",
                    width: "100%",
                    textShadow: "0 0 10px rgba(0,0,0,0.7)",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                  title={gameTitle}
                >
                  {gameTitle}
                </div>
              ) : null}
            </div>

            <div style={{ flex: 1, minWidth: 0, width: isNarrow ? "100%" : undefined }}>
              {!isNarrow ? (
                <div
                  style={{
                    fontFamily: "Roboto, sans-serif",
                    fontSize: "28.17px",
                    fontWeight: 900,
                    lineHeight: "100%",
                    marginBottom: 6,
                    textShadow: "0 0 10px rgba(0,0,0,0.7)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={gameTitle}
                >
                  {gameTitle}
                </div>
              ) : null}
              <div
                style={{
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",
                  height: isNarrow ? 78 : 86,
                }}
              >
                {showScanVip ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      padding: "6px 10px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      alignItems: "stretch",
                      gap: 4,
                      background: "#002520",
                      border: "1px solid #00FFE1",
                      boxShadow: "0 0 18px rgba(0,255,225,0.10)",
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 900,
                        color: "#fff",
                        fontSize: isNarrow ? 13 : 16,
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <span>RNG:</span>
                      <span style={{ color: "#00FF6F" }}>BẺ KHÓA</span>
                    </div>
                    <div
                      style={{
                        fontWeight: 900,
                        color: "#fff",
                        fontSize: isNarrow ? 13 : 16,
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <span>LATENCY:</span>
                      <span style={{ color: "#00FF6F" }}>{`${Math.floor(12 + Math.random() * 9)}ms`}</span>
                    </div>
                    <div
                      style={{
                        fontWeight: 900,
                        color: "#fff",
                        fontSize: isNarrow ? 13 : 16,
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <span>TỶ LỆ:</span>
                      <span style={{ color: "#FF1500" }}>BIẾN ĐỘNG CAO</span>
                    </div>
                    <button
                      type="button"
                      disabled
                      style={{
                        marginTop: 0,
                        border: "1px solid #00FFE1",
                        background: "#00691C",
                        color: "#00FF6F",
                        fontWeight: 900,
                        fontSize: isNarrow ? 12 : 15,
                        padding: "5px 12px",
                        borderRadius: 10,
                        boxShadow: "0 0 18px rgba(0,255,225,0.12)",
                        cursor: "not-allowed",
                        width: "100%",
                      }}
                    >
                      PHÂN TÍCH HOÀN TẤT
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      src={getAssetUrl("/assets/loading.webm")}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: "rotate(180deg)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 8,
                        textAlign: "center",
                        fontFamily: '"Courier New", Consolas, monospace',
                        fontSize: 13,
                        color: "rgba(200, 220, 255, 0.9)",
                        textShadow: "0 0 8px rgba(0, 0, 0, 0.9)",
                        zIndex: 2,
                      }}
                    >
                      scanning...
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 4 ô button 2x2 — kích thước/spacing như cũ */}
          <div
            className="result-modal__features"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: isNarrow ? 8 : 12,
              marginTop: 12,
            }}
          >
            <div
              style={{
                ...featureBtnBase,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.2, color: "#fff" }}>Quay mồi</div>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, color: "#F7FF00" }}>
                {manualValues.rounds} vòng - Mức min {manualValues.minBet}
              </div>
            </div>

            <div
              style={{
                ...featureBtnBase,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.2, color: "#fff" }}>Quay Auto</div>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, color: "#F7FF00" }}>
                {autoValues.rounds} vòng - Mức min {autoValues.minBet}
              </div>
            </div>

            <div
              style={{
                ...featureBtnBase,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: '"Source Code Pro", monospace',
                padding: "0 8px",
              }}
            >
              <div style={{ lineHeight: 1.15, wordBreak: "break-word" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: isNarrow ? 15 : 18 }}>Khung giờ</div>
                <div
                  style={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: isNarrow ? 13 : 16,
                    marginTop: 6,
                  }}
                >
                  {timeSlotText}
                </div>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => void handleVipFeatureClick()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void handleVipFeatureClick();
                }
              }}
              style={{
                ...vipFeatureBtnBase,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                padding: "18px 8px 0",
                cursor: "pointer",
              }}
            >
              <img
                src={getAssetUrl("/assets/vip-icon.png")}
                alt="vip"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: isNarrow ? -20 : -26,
                  transform: "translateX(-50%)",
                  width: isNarrow ? 40 : 52,
                  height: isNarrow ? 40 : 52,
                  objectFit: "contain",
                  zIndex: 3,
                  pointerEvents: "none",
                }}
              />
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>VIP FEATURE</div>
              <button
                type="button"
                disabled={isVipHackPopupStarting || isVipFeatureCharging}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleVipFeatureClick();
                }}
                style={{
                  marginTop: 2,
                  width: "80%",
                  height: 26,
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #620000 0%, #ff4400 100%)",
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: 11,
                  letterSpacing: 0.3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isVipHackPopupStarting || isVipFeatureCharging ? "not-allowed" : "pointer",
                  border: "1px solid #ff4400",
                  opacity: isVipHackPopupStarting || isVipFeatureCharging ? 0.65 : 1,
                }}
              >
                {"\u003E"} {vipHackActive ? "KÍCH HOẠT LẠI" : "KÍCH HOẠT NGAY"} {"\u003C"}
              </button>
            </div>
          </div>

          <div className="result-modal__actions">
          {vipHackUiVisible ? (
            <div
              style={{
                marginTop: 12,
                width: "100%",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minHeight: 150,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  height: 44,
                  width: "100%",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(180deg, #FF7A00 0%, #F77C00 100%)",
                  border: "2px solid #FF3B30",
                  color: "#ffffff",
                  fontWeight: 900,
                  fontSize: isNarrow ? 18 : 20,
                  boxShadow: "0 0 20px rgba(247,124,0,0.25)",
                }}
              >
                {formatMMSS(vipHackRemainingSec)}
              </div>
              <button
                type="button"
                className="frame-popup-panel__btn-secondary"
                disabled={isSpinning || vipHackRemainingSec <= 0}
                onClick={stopVipHackNow}
                style={{ width: "100%", minHeight: 42, fontSize: 14 }}
              >
                DỪNG HACK NGAY
              </button>
            </div>
          ) : isVipHackPopupStarting || vipHackActive ? (
            <div style={{ marginTop: 12, width: "100%", height: 110 }} />
          ) : hackPopupMode === "loading" ? (
            <div
              style={{
                marginTop: 12,
                width: "100%",
                height: 56,
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(255, 179, 0, 0.12)",
                border: "1px solid rgba(255, 204, 0, 0.45)",
                background: "rgba(0,0,0,0.25)",
                gap: 6,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  color: "#ffff00",
                  fontSize: isNarrow ? 15 : 16,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Đang phân tích dữ liệu với mức vốn {hackCapitalLabel}...
              </div>
              <div
                style={{
                  width: "100%",
                  height: 10,
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255, 204, 0, 0.35)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 10,
                    width: `${hackProgress}%`,
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #e5b84a 0%, #ffcc00 100%)",
                    transition: "width 0.12s linear",
                  }}
                />
              </div>
            </div>
          ) : !isHackPopupOpen ? (
            <button
              type="button"
              disabled={isSpinning}
              onClick={openHackPopup}
              onMouseEnter={() => setIsHackBtnHovered(true)}
              onMouseLeave={() => setIsHackBtnHovered(false)}
              style={{
                marginTop: 12,
                width: "100%",
                height: 56,
                border: "none",
                borderRadius: 8,
                background: "#ffcc00",
                color: "#000",
                fontSize: isNarrow ? 23 : 26,
                fontWeight: 900,
                letterSpacing: "0.04em",
                cursor: isSpinning ? "not-allowed" : "pointer",
                opacity: isSpinning ? 0.7 : 1,
                boxShadow: "0 0 18px rgba(255, 204, 0, 0.35)",
                transition: "transform 0.15s ease, filter 0.15s ease",
                transform: isHackBtnHovered ? "translateY(2px)" : "translateY(0)",
                filter: isHackBtnHovered ? "brightness(0.92)" : "brightness(1)",
              }}
            >
              HACK (10TOKEN)
            </button>
          ) : (
            <div style={{ marginTop: 12, width: "100%", height: 56 }} />
          )}
          </div>
          </div>
        </div>

        <aside className="home-panel result-page__side">
          <h2 className="home-panel__head home-panel__head--status">
            <span className="home-panel__head-dot" aria-hidden />
            TRẠNG THÁI HỆ THỐNG
          </h2>
          <div className="home-panel__body">
            <div className="home-status-feed" aria-live="polite">
              <div className="home-status-feed__track">
                {statusLines.map((user, i) => (
                  <p className="home-status-feed__line" key={`${user}-${i}`}>
                    <span className="home-status-feed__user">{user}</span> vừa đăng nhập vào hệ thống
                  </p>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TableGameResultLayout;
