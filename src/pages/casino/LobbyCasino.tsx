import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import HomeMarquee from "../../components/HomeMarquee";
import ModalConfirmLogout from "../../components/ModalConfirmLogout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getAssetUrl } from "../../utils/assetUrl";
import ResultTable from "../../components/ResultTable";
import HackerLiveFeed from "../../components/HackerLiveFeed";
import LobbyConfirmTableModal from "../../components/LobbyConfirmTableModal";
import "./LobbyCasino.css";

/** Đếm P / Hòa / B từ totalRound (cùng logic symbol với ResultTable) */
function countPlayerTieBanker(totalRound?: any[]) {
  if (!Array.isArray(totalRound) || totalRound.length === 0) {
    return { player: 0, tie: 0, banker: 0 };
  }
  let player = 0;
  let tie = 0;
  let banker = 0;
  for (const item of totalRound) {
    const r = item.road;
    if ([8, 9, 10].includes(r)) player += 1;
    else if ([0, 1, 2].includes(r)) banker += 1;
    else tie += 1;
  }
  return { player, tie, banker };
}

/**
 * Giống LobbyRoom (selectedKey = 1): ưu tiên ai0, không có thì groupRoad.
 * percentCurrent.Player / Tier / Banker hiển thị như trang /casino/room/C04.
 */
function getLobbyTableRoundLikeRoom(table: any) {
  if (!table) return null;
  return table.ai0 ?? table.groupRoad ?? null;
}

function formatPercentOrFallback(
  raw: unknown,
  fallback: string
): string {
  if (raw === null || raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (Number.isNaN(n)) return fallback;
  return `${Math.round(n)}%`;
}

/** Tổng P/Hòa/B: cùng nguồn % như box-statistic trên LobbyRoom, fallback đếm từ totalRound */
function getLobbyPtbDisplay(table: any, ptb: { player: number; tie: number; banker: number }) {
  const tr = getLobbyTableRoundLikeRoom(table);
  const pc = tr?.percentCurrent;
  return {
    player: formatPercentOrFallback(pc?.Player, String(ptb.player)),
    tie: formatPercentOrFallback(pc?.Tier, String(ptb.tie)),
    banker: formatPercentOrFallback(pc?.Banker, String(ptb.banker)),
  };
}

/**
 * API get-table-by-name giống LobbyRoom: `axios.data.data.percentCurrent`.
 * Nếu body phẳng đã có percentCurrent/ai0 thì giữ; không thì lấy lớp `data` bọc trong.
 */
function unwrapPredictTablePayload(resBody: any): any {
  if (resBody == null || typeof resBody !== "object") return resBody;
  const hasFlatTable =
    resBody.percentCurrent != null ||
    resBody.ai0 != null ||
    resBody.groupRoad != null ||
    Array.isArray(resBody.totalRound);
  if (hasFlatTable) return resBody;
  const inner = resBody.data;
  if (inner != null && typeof inner === "object" && !Array.isArray(inner)) {
    return inner;
  }
  return resBody;
}

function getLobbyWinPercentNumber(table: any): number | null {
  if (table?.maintenance === 1) return null;
  const root =
    table?.percentCurrent?.Forecast ??
    table?.data?.percentCurrent?.Forecast;
  const tr = getLobbyTableRoundLikeRoom(table);
  const fromAi = tr?.percentCurrent?.Forecast;
  const v = root ?? fromAi;
  if (v == null || v === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return n;
}

function getLobbyWinPercent(table: any): string | null {
  const n = getLobbyWinPercentNumber(table);
  if (n == null) return null;
  return `${Math.round(n)}%`;
}

/** Nút: >90% vàng (ảnh SUPER VIP) | 80–90% xanh đậm | <80% #00ff6e | không số: vàng */
function getWinBadgeVariant(
  pct: number | null
): "supervip" | "below80" | "normal" | "unknown" {
  if (pct == null) return "unknown";
  if (pct > 90) return "supervip";
  if (pct < 80) return "below80";
  return "normal";
}

/** Super VIP (>90%) lên đầu, sau đó giảm dần theo %; không có % xuống cuối */
function sortLobbyRoomsByWinRate(a: any, b: any): number {
  const pa = getLobbyWinPercentNumber(a);
  const pb = getLobbyWinPercentNumber(b);
  const aSuper = pa != null && pa > 90;
  const bSuper = pb != null && pb > 90;
  if (aSuper && !bSuper) return -1;
  if (!aSuper && bSuper) return 1;
  const na = pa ?? Number.NEGATIVE_INFINITY;
  const nb = pb ?? Number.NEGATIVE_INFINITY;
  return nb - na;
}

/** Hiển thị trên thanh trạng thái (có thể gán env sau) */
const LOBBY_SERVER_LABEL =
  process.env.REACT_APP_CASINO_LOBBY_SERVER ?? "ASIA_SEXY_V1";

export default function BaccaratRoomList() {
  const [isShowLogout, setIsShowLogout] = useState(false);
  const [dataRoom, setDataRom] = useState<any>([]);
  /** Bàn đang chọn trong popup xác nhận (null = đóng) */
  const [pendingTableName, setPendingTableName] = useState<string | null>(null);
  const Cookies = require("js-cookie");
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);

  const token = Cookies.get("access_token");
  const user_infor = localStorage.getItem("user_info");

  const sortedRooms = useMemo(
    () => [...dataRoom].sort(sortLobbyRoomsByWinRate),
    [dataRoom]
  );

  useEffect(() => {
    if (user_infor) {
      const test = JSON.parse(user_infor);
      setCoins(test.coins);
    }
  }, [user_infor]);

  const openConfirmTable = (value: any) => {
    if (value?.tableName) setPendingTableName(String(value.tableName));
  };

  const closeConfirmTable = () => setPendingTableName(null);

  const confirmEnterTable = () => {
    if (!pendingTableName) return;
    if (coins !== 0) {
      navigate(`/casino/room/${pendingTableName}`);
      setPendingTableName(null);
    } else {
      setPendingTableName(null);
      Swal.fire({
        icon: "error",
        title: "Lỗi tải dữ liệu",
        text: "Vui lòng nạp thêm xu vào tài khoản!",
        customClass: {
          popup: "bg-custom-image text-white",
        },
      });
    }
  };

  const RoomCard = ({ value }: any) => {
    const ptb = countPlayerTieBanker(value.totalRound);
    const ptbDisplay = getLobbyPtbDisplay(value, ptb);
    const winNum = getLobbyWinPercentNumber(value);
    const winPct = getLobbyWinPercent(value) ?? "—";
    const badgeVariant = getWinBadgeVariant(winNum);
    /** Dưới 80%: nhãn "RỦI RO CAO" (cùng nhóm style below80) */
    const vipHeadIsRisk = winNum != null && winNum < 80;

    return (
      <div
        className="casino-lobby-table-card"
        style={{
          backgroundImage: `url(${getAssetUrl("/assets/bg-result.png")})`,
        }}
        onClick={() => openConfirmTable(value)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openConfirmTable(value);
          }
        }}
      >
        <div className="casino-lobby-table-card__body">
          {/* Thanh tên bàn + LIVE: nằm trực tiếp trên nền bg-result, không dùng header/nền đen */}
          <div className="casino-lobby-table-card__topbar">
            <div className="casino-lobby-table-card__title-row">
              <span className="casino-lobby-table-card__label-baccarat">
                BÀN BACCARAT{" "}
              </span>
              <span className="casino-lobby-table-card__table-name">
                {value.tableName}
              </span>
            </div>
            <div className="casino-lobby-table-card__live" aria-label="Trực tiếp">
              <span className="casino-lobby-table-card__live-dot" aria-hidden />
              <span className="casino-lobby-table-card__live-text">LIVE</span>
            </div>
          </div>

          {/* Cùng dữ liệu /casino/room/:table — get-table-by-name sau khi load list */}
          <div className="casino-lobby-modal-result">
            <div className="casino-lobby-table-card__stats" role="group" aria-label="Tổng kết P-H-B">
              <div className="casino-lobby-table-card__stat-col casino-lobby-table-card__stat-col--player">
                <span className="casino-lobby-table-card__stat-num">{ptbDisplay.player}</span>
                <span className="casino-lobby-table-card__stat-caption">PLAYER</span>
              </div>
              <div className="casino-lobby-table-card__stat-col casino-lobby-table-card__stat-col--tie">
                <span className="casino-lobby-table-card__stat-num">{ptbDisplay.tie}</span>
                <span className="casino-lobby-table-card__stat-caption">HÒA</span>
              </div>
              <div className="casino-lobby-table-card__stat-col casino-lobby-table-card__stat-col--banker">
                <span className="casino-lobby-table-card__stat-num">{ptbDisplay.banker}</span>
                <span className="casino-lobby-table-card__stat-caption">BANKER</span>
              </div>
            </div>

            <div className="casino-lobby-table-card__mid">
              <div className="casino-lobby-table-card__grid-wrap">
                <ResultTable tableData={value.totalRound} compact />
              </div>
              <aside className="casino-lobby-table-card__vip">
                {badgeVariant === "supervip" ? (
                  <img
                    className="casino-lobby-table-card__supervip-img"
                    src={getAssetUrl("/assets/text-supervip.png")}
                    alt="Super VIP"
                  />
                ) : (
                  <div
                    className={`casino-lobby-table-card__vip-head casino-lobby-table-card__vip-head--${badgeVariant}`}
                  >
                    {vipHeadIsRisk ? "RỦI RO CAO" : "TỶ LỆ THẮNG"}
                  </div>
                )}
                <div className="casino-lobby-table-card__vip-fill" aria-hidden />
                <div
                  className={`casino-lobby-table-card__win-badge casino-lobby-table-card__win-badge--${badgeVariant}`}
                >
                  <span className="casino-lobby-table-card__win-label">WIN</span>
                  <span className="casino-lobby-table-card__win-pct">{winPct}</span>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Swal.fire({
      title: "Đang tải dữ liệu trò chơi",
      html: "<p class='swal-loading-subtext'>Load Data.</p><div class='swal-loading-dots'><span class='swal-dot swal-dot-cyan'></span><span class='swal-dot swal-dot-orange'></span></div>",
      customClass: {
        popup: "swal-loading-modal",
      },
      allowOutsideClick: false,
      showConfirmButton: false,
    });
    const timeout = setTimeout(() => {
      const base = process.env.REACT_APP_URL_API_CASINO;

      axios
        .get(`${base}/predict/get-all-table`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(async (res) => {
          const basic = Array.isArray(res.data) ? res.data : [];
          if (cancelled) return;

          if (basic.length === 0) {
            setDataRom([]);
            return;
          }

          /** Giống LobbyRoom: gọi get-table-by-name để có totalRound, ai0, percentCurrent… */
          const enriched = await Promise.all(
            basic.map(async (t: any) => {
              const name = t?.tableName;
              if (!name) return t;
              try {
                const res = await axios.get(
                  `${base}/predict/get-table-by-name`,
                  {
                    params: { tableName: name },
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                const detail = unwrapPredictTablePayload(res.data);
                return {
                  ...t,
                  ...detail,
                  id: t.id,
                  tableName: t.tableName ?? detail?.tableName ?? name,
                };
              } catch {
                return t;
              }
            })
          );

          if (!cancelled) setDataRom(enriched);
        })
        .catch((err) => console.log(err))
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
            Swal.close();
          }
        });
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [token]);

  return (
    <div className="casino-lobby-page">
      <Header setIsShowLogout={() => setIsShowLogout(true)} />

      {/* Marquee bám sát header */}
      <HomeMarquee className="home-marquee--tight home-marquee--lobby" />

      {/* Nền cũ: giống lobby trước (container-fluid + lobby-bg + bg-cover) */}
      <div
        className="min-h-screen bg-cover bg-center container-fluid lobby-bg position-relative mx-auto mb-5 max-w-screen-xl"
      >
        <div className="container mx-auto px-4 pt-6 pb-10">
          <div className="casino-lobby-hero" role="region" aria-label="Lobby baccarat">
            <div className="casino-lobby-hero__inner">
              <button
                type="button"
                className="casino-lobby-back"
                onClick={() => navigate("/")}
                aria-label="Về trang chủ"
              >
                <img
                  className="casino-lobby-back__icon"
                  src={getAssetUrl("/assets/arrow-back.png")}
                  alt=""
                  aria-hidden
                />
                BACK
              </button>

              <h1 className="casino-lobby-title">HACK SEXY BACCARAT</h1>

              <div className="casino-lobby-status" aria-live="polite">
                <span>SEVER:</span>{" "}
                <span className="casino-lobby-status__gold">
                  {LOBBY_SERVER_LABEL}
                </span>
                <span className="casino-lobby-status__sep" aria-hidden>
                  |
                </span>
                <span>STATUS:</span>{" "}
                <span className="casino-lobby-status__online">ONLINE</span>
              </div>
            </div>
          </div>

          {!isLoading && (
            <div className="casino-lobby-tables">
              {sortedRooms.map((e: any) => (
                <RoomCard key={e.id} value={e} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ModalConfirmLogout
        isShowLogout={isShowLogout}
        setIsShowLogout={() => {
          setIsShowLogout(false);
        }}
      />

      <LobbyConfirmTableModal
        open={pendingTableName != null}
        tableName={pendingTableName ?? ""}
        onClose={closeConfirmTable}
        onConfirm={confirmEnterTable}
      />

      {/* Tin tức terminal — 2 góc dưới; mobile rất hẹp chỉ còn panel trái */}
      <HackerLiveFeed side="left" variant="live" />
      <HackerLiveFeed side="right" variant="terminal" />
    </div>
  );
}
