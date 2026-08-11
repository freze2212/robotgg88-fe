import React, { useEffect, useMemo, useRef, useState } from "react";
import { toZonedTime, format } from "date-fns-tz";
import { DateTime } from "luxon";
import ResultTable from "../../components/ResultTable";
import BigRoadBoard from "../../components/BigRoadBoard";
import Header from "../../components/Header";
import HomeMarquee from "../../components/HomeMarquee";
import ModalConfirmLogout from "../../components/ModalConfirmLogout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { getAssetUrl } from "../../utils/assetUrl";
import "../../pages/login/css/main.login.css";
import "./LobbyRoom.css";
const Cookies = require("js-cookie");

function roadToLabel(road: number | undefined): string {
  if (road == null) return "TIE";
  if ([8, 9, 10].includes(road)) return "PLAYER";
  if ([0, 1, 2].includes(road)) return "BANKER";
  return "TIE";
}

/** PLAYER / BANKER / HÒA — dùng cho bảng lịch sử */
function roadToResultVN(road: number | undefined): "PLAYER" | "BANKER" | "HÒA" {
  if (road == null) return "HÒA";
  if ([8, 9, 10].includes(road)) return "PLAYER";
  if ([0, 1, 2].includes(road)) return "BANKER";
  return "HÒA";
}

/** Đếm P / Hòa / B từ totalRound (cùng logic ResultTable / LobbyCasino) */
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

function getSessionDisplayId(item: any, index: number): string {
  const stamp = item?.stampTime;
  const sid = item?.sessionId ?? item?.sessionID;
  if (sid != null && String(sid).length > 0) return `#${sid}`;
  if (stamp != null) return `#${String(stamp)}`;
  if (item?.id != null) return `#${String(item.id)}`;
  return `#${index}`;
}

/** BE thường camelCase JSON → `round` chứ không phải `Round` */
function readRoundFromPercentCurrent(pc: any): string | undefined {
  if (pc == null || typeof pc !== "object") return undefined;
  const v = (pc as any).Round ?? (pc as any).round;
  if (v == null || v === "") return undefined;
  return String(v).trim();
}

/** API có thể trả payload phẳng hoặc bọc trong `data` */
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

/** Khóa ổn định cho mỗi ván trong totalRound (lưu dự đoán theo phiên) */
function getRoundStorageKey(item: any): string {
  if (item?.stampTime != null) return `t:${String(item.stampTime)}`;
  if (item?.id != null) return `id:${String(item.id)}`;
  return "";
}

const ROUND_PREDICTION_CACHE_PREFIX = "roomPredictCacheLocal:";
const ROUND_PREDICTION_CACHE_MAX = 300;

function buildRoundPredictionCacheKey(tableId?: string): string | null {
  if (!tableId) return null;
  return `${ROUND_PREDICTION_CACHE_PREFIX}${tableId}`;
}

function pruneRoundPredictionMap(map: Map<string, string>): Map<string, string> {
  if (map.size <= ROUND_PREDICTION_CACHE_MAX) return map;
  const next = new Map(map);
  while (next.size > ROUND_PREDICTION_CACHE_MAX) {
    const firstKey = next.keys().next().value as string | undefined;
    if (!firstKey) break;
    next.delete(firstKey);
  }
  return next;
}

/**
 * Cùng nguồn với ô "DỰ ĐOÁN: VÁN KẾ TIẾP" (ai slot → percentCurrent → root → isPlayer).
 */
function liveDuDoanFromTablePayload(
  selectedAiPercentCurrent: any,
  rootPercentCurrent: any,
  isPlayerFallback: string | undefined
): string {
  const str =
    readRoundFromPercentCurrent(selectedAiPercentCurrent) ??
    readRoundFromPercentCurrent(rootPercentCurrent) ??
    isPlayerFallback;
  if (str == null) return "—";
  const u = String(str).toUpperCase();
  if (u === "P" || u === "PLAYER") return "PLAYER";
  if (u === "B" || u === "BANKER") return "BANKER";
  return "—";
}

/** Kết quả HÒA thì đánh giá HÒA; còn lại so dự đoán với kết quả. */
function evaluateDanhGia(
  duDoan: string,
  ketQua: "PLAYER" | "BANKER" | "HÒA"
): "THẮNG" | "THUA" | "HÒA" | "—" {
  if (ketQua === "HÒA") return "HÒA";
  if (duDoan === "—") return "—";
  return duDoan === ketQua ? "THẮNG" : "THUA";
}

function pillClassForSide(label: string): string {
  if (label === "PLAYER") return "room-pill--player";
  if (label === "BANKER") return "room-pill--banker";
  if (label === "HÒA") return "room-pill--hoa-kq";
  return "room-pill--empty";
}

function pillClassForDanhGia(l: "THẮNG" | "THUA" | "HÒA" | "—"): string {
  if (l === "—") return "room-pill--dg-none";
  if (l === "HÒA") return "room-pill--dg-hoa";
  if (l === "THẮNG") return "room-pill--dg-win";
  return "room-pill--dg-lose";
}

function formatLogTime(stampTime?: number): string {
  if (!stampTime) return "--:--:--";
  try {
    const localDate = toZonedTime(new Date(stampTime), "Asia/Ho_Chi_Minh");
    return format(localDate, "HH:mm:ss", { timeZone: "Asia/Ho_Chi_Minh" });
  } catch {
    return "--:--:--";
  }
}

/** Mỗi bên 10 model: ai0–ai9 (PLAYER), ai10–ai19 (BANKER) */
const AI_SLOTS_PER_SIDE = 10;
const AI_TOTAL_SLOTS = AI_SLOTS_PER_SIDE * 2;

type AiSlotRow = {
  key: number;
  aiIndex: number;
  forecast: number;
  forecastRaw: number;
  round: "P" | "B" | "-";
};

/**
 * Chia 100% cho n ô theo trọng số (largest remainder), luôn sum = 100.
 * Mỗi ô tối thiểu MIN_PCT_PER_SLOT% (10 ô → tối đa 50% “sàn”, 50% còn lại chia theo trọng số).
 */
const MIN_PCT_PER_SLOT = 5;

function distributeIntegerPercents(weights: number[]): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const reserved = MIN_PCT_PER_SLOT * n;
  if (reserved > 100) {
    const base = Math.floor(100 / n);
    const out = Array(n).fill(base);
    let rem = 100 - base * n;
    for (let i = 0; i < rem; i++) out[i]++;
    return out;
  }
  const pool = 100 - reserved;
  const sumW = weights.reduce((a, b) => a + b, 0);
  if (sumW <= 0) {
    const base = Math.floor(pool / n);
    const out = Array(n).fill(MIN_PCT_PER_SLOT + base);
    let rem = pool - base * n;
    for (let i = 0; i < rem; i++) out[i]++;
    return out;
  }
  const exact = weights.map((w) => (pool * w) / sumW);
  const floors = exact.map((x) => Math.floor(x));
  const remainder = pool - floors.reduce((a, b) => a + b, 0);
  const order = exact
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac);
  const out = floors.map((f) => f + MIN_PCT_PER_SLOT);
  for (let k = 0; k < remainder; k++) {
    out[order[k].i]++;
  }
  return out;
}

function hashStringToUint32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** RNG xác định theo seed — cùng seed → cùng dãy (không nhảy mỗi lần poll). */
function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Trọng số ngẫu nhiên có cấu trúc theo dự đoán ván kế tiếp:
 * - Phe trùng (B → cột Banker, P → cột Player): ưu ĐIỂM 5–9.
 * - Cột đối: ưu ĐIỂM 0–5 (tương ứng 1–6), hạ 6–9.
 */
function randomWeightsForColumn(
  column: "player" | "banker",
  next: "P" | "B" | null,
  rng: () => number
): number[] {
  const favored =
    next != null &&
    ((next === "B" && column === "banker") ||
      (next === "P" && column === "player"));

  const weights: number[] = [];
  for (let i = 0; i < AI_SLOTS_PER_SIDE; i++) {
    let base = 0.3 + rng() * 0.7;
    if (next == null) {
      base *= 0.88 + rng() * 0.28;
    } else if (favored) {
      if (i >= 5) base *= 1.25 + rng() * 0.22;
      else base *= 0.74 + rng() * 0.14;
    } else {
      if (i <= 5) base *= 1.22 + rng() * 0.24;
      else base *= 0.68 + rng() * 0.12;
    }
    weights.push(Math.max(0.12, base));
  }
  return weights;
}

/**
 * % mỗi ô: RNG có seed (bàn + dự đoán ván kế + số ván đã có) → đổi theo phiên / khi P↔B.
 * forecastRaw/round vẫn lấy từ API để hiển thị; tổng mỗi bảng = 100, tối thiểu 5%/ô.
 */
function buildAiSlots(
  dataRoom: any,
  nextVanSide: "P" | "B" | null,
  seedKey: string
): {
  playerSlots: AiSlotRow[];
  bankerSlots: AiSlotRow[];
} {
  const seed = hashStringToUint32(seedKey);
  const rng = mulberry32(seed);
  const weightsLeft = randomWeightsForColumn("player", nextVanSide, rng);
  const weightsRight = randomWeightsForColumn("banker", nextVanSide, rng);

  const pctLeft = distributeIntegerPercents(weightsLeft);
  const pctRight = distributeIntegerPercents(weightsRight);

  const base: Omit<AiSlotRow, "forecast">[] = Array.from(
    { length: AI_TOTAL_SLOTS },
    (_, aiIndex) => {
      const aiData = dataRoom?.[`ai${aiIndex}`];
      const pc = aiData?.percentCurrent;
      const raw = Number(
        (pc as any)?.Forecast ?? (pc as any)?.forecast ?? 0
      );
      const r = readRoundFromPercentCurrent(pc);
      let round: "P" | "B" | "-" = "-";
      if (r != null) {
        const u = r.toUpperCase();
        if (u === "P" || u === "PLAYER") round = "P";
        else if (u === "B" || u === "BANKER") round = "B";
      }
      return {
        key: aiIndex + 1,
        aiIndex,
        forecastRaw: Math.round(raw),
        round,
      };
    }
  );

  const adjusted: AiSlotRow[] = base.map((s, i) => {
    const isLeft = i < AI_SLOTS_PER_SIDE;
    const localIdx = isLeft ? i : i - AI_SLOTS_PER_SIDE;
    const forecast = isLeft ? pctLeft[localIdx] : pctRight[localIdx];
    return {
      ...s,
      forecast,
    };
  });

  return {
    playerSlots: adjusted.slice(0, AI_SLOTS_PER_SIDE),
    bankerSlots: adjusted.slice(AI_SLOTS_PER_SIDE),
  };
}

const LobbyRoom: React.FC = () => {
  const { id } = useParams();
  const [isShowLogout, setIsShowLogout] = useState(false);
  const [dataRoom, setDataRoom] = useState<any>();
  const [coin, setCoin] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("user_info");
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return Number(parsed?.coins ?? 0);
    } catch {
      return 0;
    }
  });
  const [loading, setLoading] = useState(false);
  const [isPlayer, setIsPlayer] = useState<string>();
  const [tableRound, setTableRound] = useState<any>();
  const [shuffle, setShuffle] = useState<number | null>(null);
  const [selectedKey, setSelectedKey] = useState<number | null>(1);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [maintenanceFeeLogs, setMaintenanceFeeLogs] = useState<number[]>([]);

  /** Dự đoán đã khóa theo từng ván (khi có ván mới trong totalRound) — không đổi theo poll sau */
  const [roundPredictionByKey, setRoundPredictionByKey] = useState<
    Map<string, string>
  >(() => new Map());
  const snapshotPredictionRef = useRef<string>("—");
  const lastValidPredictionRef = useRef<string>("—");
  const prevRoundIdsRef = useRef<Set<string>>(new Set());

  const token = Cookies.get("access_token");

  useEffect(() => {
    snapshotPredictionRef.current = "—";
    lastValidPredictionRef.current = "—";
    prevRoundIdsRef.current = new Set();
    setMaintenanceFeeLogs([]);
    const cacheKey = buildRoundPredictionCacheKey(id);
    if (!cacheKey) {
      setRoundPredictionByKey(new Map());
      setSelectedKey(1);
      return;
    }
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) {
        setRoundPredictionByKey(new Map());
      } else {
        const parsed = JSON.parse(raw) as Record<string, string>;
        const loaded = new Map<string, string>();
        Object.entries(parsed).forEach(([k, v]) => {
          if (!k) return;
          if (v === "PLAYER" || v === "BANKER") {
            loaded.set(k, v);
          }
        });
        const pruned = pruneRoundPredictionMap(loaded);
        setRoundPredictionByKey(pruned);
      }
    } catch {
      setRoundPredictionByKey(new Map());
    }
    setSelectedKey(1);
  }, [id]);

  useEffect(() => {
    const cacheKey = buildRoundPredictionCacheKey(id);
    if (!cacheKey) return;
    try {
      const payload = Object.fromEntries(roundPredictionByKey.entries());
      localStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch {
      // ignore storage quota / private mode
    }
  }, [id, roundPredictionByKey]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const deductRoomFee = () => {
      axios
        .post(
          `${process.env.REACT_APP_URL_API}/users/subtract-coins-for-action`,
          {
            amount: 5,
            action: "PLAY_GAME",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((data) => {
          setCoin(data.data.coins);
          setMaintenanceFeeLogs((prev) => {
            const next = [Date.now(), ...prev];
            return next.slice(0, 30);
          });
        })
        .catch((err) => {
          const message = err?.response?.data?.message;
          if (
            err?.response?.status === 400 &&
            message === "Số xu hiện tại không đủ để thực hiện hành động: PLAY_GAME"
          ) {
            Swal.fire({
              icon: "error",
              title: "Lỗi tải dữ liệu",
              text: message,
              customClass: {
                popup: "custom-swal",
              },
            });
            navigate("/casino/lobby");
          }
        });
    };

    // Trừ phí vào bàn ngay, sau đó trừ phí duy trì mỗi 30 giây.
    void deductRoomFee();
    const feeInterval = window.setInterval(deductRoomFee, 30_000);
    return () => window.clearInterval(feeInterval);
  }, [token, navigate, id]);

  useEffect(() => {
    const userInfoString = localStorage.getItem("user_info");
    if (!userInfoString) return;
    try {
      const userInfo = JSON.parse(userInfoString);
      userInfo.coins = coin;
      localStorage.setItem("user_info", JSON.stringify(userInfo));
      window.dispatchEvent(
        new CustomEvent("user-coins-updated", { detail: { coins: coin } })
      );
    } catch {
      // ignore parse errors
    }
  }, [coin]);

  useEffect(() => {
    const t = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (dataRoom === undefined) {
      setLoading(true);

      Swal.fire({
        title: "Đang tải dữ liệu trò chơi",
        html: "<p class='swal-loading-subtext'>Load Data.</p><div class='swal-loading-dots'><span class='swal-dot swal-dot-cyan'></span><span class='swal-dot swal-dot-orange'></span></div>",
        customClass: {
          popup: "swal-loading-modal",
        },
        allowOutsideClick: false,
        showConfirmButton: false,
      });
    }
    if (dataRoom) {
      Swal.close();
      setLoading(false);
    }
  }, [dataRoom]);

  useEffect(() => {
    let cancelled = false;

    const fetchTable = () => {
      axios
        .get(
          `${process.env.REACT_APP_URL_API_CASINO}/predict/get-table-by-name?tableName=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          if (cancelled) return;
          const payload = unwrapPredictTablePayload(res.data);
          const pc = payload?.percentCurrent;
          setIsPlayer(
            (pc as any)?.Round ?? (pc as any)?.round ?? undefined
          );
          setDataRoom(payload);
        })
        .catch(() => undefined);
    };

    const timeout = setTimeout(fetchTable, 1000);
    const interval = setInterval(fetchTable, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [id, token]);

  useEffect(() => {
    if (!dataRoom) return;
    if (dataRoom.shuffle !== 0) {
      setShuffle(0);
    }
    const idx = Math.max(0, Math.min(AI_TOTAL_SLOTS - 1, (selectedKey ?? 1) - 1));
    setTableRound(dataRoom[`ai${idx}`]);
  }, [dataRoom, selectedKey]);

  let countDown = 0;

  if (dataRoom?.statusGame === "GP_NEW_GAME_START") {
    const currentTime = dataRoom?.timeCurrent || DateTime.now().setZone("Asia/Ho_Chi_Minh", { keepLocalTime: false });
    const roundStartTime = dataRoom?.roundStartTime;
    const timePassed = currentTime - roundStartTime;
    const totalDuration = dataRoom?.iTime * 1000;
    const countDownUnix = Math.max(totalDuration - timePassed, 0);
    countDown = Math.floor(countDownUnix / 1000);
  }

  const selectedAi = dataRoom?.[
    `ai${Math.max(0, Math.min(AI_TOTAL_SLOTS - 1, (selectedKey ?? 1) - 1))}`
  ];

  /** Cùng nguồn với ô “DỰ ĐOÁN: VÁN KẾ TIẾP” — dùng bias % theo bảng Player/Banker. */
  const nextVanSidePb = useMemo((): "P" | "B" | null => {
    const str =
      readRoundFromPercentCurrent(selectedAi?.percentCurrent) ??
      readRoundFromPercentCurrent(dataRoom?.percentCurrent) ??
      isPlayer;
    if (str == null || str === "") return null;
    const u = String(str).toUpperCase();
    if (u === "P" || u === "PLAYER") return "P";
    if (u === "B" || u === "BANKER") return "B";
    return null;
  }, [selectedAi, dataRoom?.percentCurrent, isPlayer]);

  const totalRoundLen = Array.isArray(dataRoom?.totalRound)
    ? dataRoom.totalRound.length
    : 0;

  /** Đổi seed khi đổi bàn / dự đoán ván kế / có ván mới → bảng % random tái tính. */
  const aiPercentSeedKey = useMemo(
    () => `${id ?? ""}|${nextVanSidePb ?? "null"}|${totalRoundLen}`,
    [id, nextVanSidePb, totalRoundLen]
  );

  const { playerSlots, bankerSlots } = useMemo(
    () => buildAiSlots(dataRoom, nextVanSidePb, aiPercentSeedKey),
    [dataRoom, nextVanSidePb, aiPercentSeedKey]
  );
  const selectedPc = selectedAi?.percentCurrent ?? dataRoom?.percentCurrent;
  const selectedForecast =
    Math.round(
      Number(
        (selectedPc as any)?.Forecast ?? (selectedPc as any)?.forecast ?? 0
      )
    );
  const selectedRoundStr =
    readRoundFromPercentCurrent(selectedAi?.percentCurrent) ??
    readRoundFromPercentCurrent(dataRoom?.percentCurrent) ??
    isPlayer;
  const selectedWinner =
    selectedRoundStr != null &&
    String(selectedRoundStr).toUpperCase().match(/^(P|PLAYER)/i)
      ? "P"
      : "B";

  /** Cột DỰ ĐOÁN lịch sử = đúng giá trị ô VÁN KẾ TIẾP (không đọc từng dòng totalRound) */
  const duDoanLiveLabel = useMemo(
    () =>
      liveDuDoanFromTablePayload(
        selectedAi?.percentCurrent,
        dataRoom?.percentCurrent,
        isPlayer
      ),
    [selectedAi, dataRoom?.percentCurrent, isPlayer]
  );

  useEffect(() => {
    if (duDoanLiveLabel === "PLAYER" || duDoanLiveLabel === "BANKER") {
      lastValidPredictionRef.current = duDoanLiveLabel;
    }
  }, [duDoanLiveLabel]);

  /**
   * Chỉ snapshot cho phiên MỚI xuất hiện.
   * - Phiên cũ đã có trong danh sách trước đó: giữ nguyên giá trị đã lưu.
   * - Không backfill ngược toàn bộ lịch sử bằng dự đoán hiện tại.
   */
  useEffect(() => {
    const raw = dataRoom?.totalRound;
    if (!Array.isArray(raw) || raw.length === 0) return;

    const sorted = [...raw].sort(
      (a: any, b: any) => (a.stampTime ?? 0) - (b.stampTime ?? 0)
    );
    const currentKeys = new Set(
      sorted
        .map((item: any) => getRoundStorageKey(item))
        .filter(Boolean)
    );

    const currentLive =
      duDoanLiveLabel === "PLAYER" || duDoanLiveLabel === "BANKER"
        ? duDoanLiveLabel
        : lastValidPredictionRef.current;
    const frozenCandidate =
      snapshotPredictionRef.current === "PLAYER" ||
      snapshotPredictionRef.current === "BANKER"
        ? snapshotPredictionRef.current
        : lastValidPredictionRef.current;
    const newRoundKeys = sorted
      .map((item: any) => getRoundStorageKey(item))
      .filter((k: string) => Boolean(k) && !prevRoundIdsRef.current.has(k));

    setRoundPredictionByKey((prev) => {
      const next = new Map(prev);
      const fillValue =
        frozenCandidate === "PLAYER" || frozenCandidate === "BANKER"
          ? frozenCandidate
          : currentLive;
      if (fillValue !== "PLAYER" && fillValue !== "BANKER") {
        return pruneRoundPredictionMap(next);
      }

      // Safety seed: luôn gán cho phiên mới nhất nếu phiên đó chưa có dự đoán.
      const latestRound = sorted[sorted.length - 1];
      const latestKey = latestRound ? getRoundStorageKey(latestRound) : "";
      if (latestKey && !next.has(latestKey)) {
        next.set(latestKey, fillValue);
      }

      // Lần đầu nhận totalRound: chỉ tạo baseline, không gán ngược lịch sử.
      if (prevRoundIdsRef.current.size === 0) {
        return pruneRoundPredictionMap(next);
      }

      for (const item of sorted) {
        const k = getRoundStorageKey(item);
        if (!k) continue;
        // Chỉ gán cho phiên mới (chưa xuất hiện ở poll trước).
        if (!prevRoundIdsRef.current.has(k) && !next.has(k)) {
          next.set(k, fillValue);
        }
      }
      return pruneRoundPredictionMap(next);
    });

    snapshotPredictionRef.current = currentLive;
    prevRoundIdsRef.current = currentKeys;
  }, [dataRoom?.totalRound, duDoanLiveLabel]);

  const tableTitle = dataRoom?.tableName ?? id ?? "--";

  const serverLabel =
    process.env.REACT_APP_CASINO_LOBBY_SERVER ?? "ASIA_SEXY_V1";

  const systemLogItems = useMemo(() => {
    const rounds = Array.isArray(dataRoom?.totalRound)
      ? [...dataRoom.totalRound].slice(-12).reverse()
      : [];
    const roundLogs = rounds.map((item: any) => ({
      stampTime: item?.stampTime as number | undefined,
      time: formatLogTime(item?.stampTime),
      message: `AI đồng bộ dữ liệu vòng ${item?.id ?? "--"}: ${roadToLabel(
        item?.road
      )}`,
    }));
    const feeLogs = maintenanceFeeLogs.map((ts) => ({
      stampTime: ts,
      time: formatLogTime(ts),
      message: "Phí duy trì - 5xu",
    }));
    return [...feeLogs, ...roundLogs]
      .sort((a, b) => (b.stampTime ?? 0) - (a.stampTime ?? 0))
      .slice(0, 24)
      .map(({ time, message }) => ({ time, message }));
  }, [dataRoom?.totalRound, maintenanceFeeLogs]);

  const decodeItems = useMemo(() => {
    const rounds = Array.isArray(tableRound?.groupRoad?.table)
      ? [...tableRound.groupRoad.table].slice(-12).reverse()
      : [];
    return rounds.map((item: any) => ({
      time: formatLogTime(item?.stampTime),
      message: `QUÉT DỮ LIỆU BÀN C${id ?? "--"} / VÒNG ${
        item?.id ?? "--"
      } [${item?.groupWin ? "THẮNG" : "THUA"}]`,
    }));
  }, [id, tableRound?.groupRoad?.table]);

  const liveClock = useMemo(() => {
    try {
      const localDate = toZonedTime(new Date(nowTick), "Asia/Ho_Chi_Minh");
      return format(localDate, "HH:mm:ss", { timeZone: "Asia/Ho_Chi_Minh" });
    } catch {
      return "--:--:--";
    }
  }, [nowTick]);

  /** Cùng thứ tự với ResultTable: sort theo stampTime, lấy N ván mới nhất */
  const historyItems = useMemo(() => {
    const raw = Array.isArray(dataRoom?.totalRound) ? dataRoom.totalRound : [];
    if (raw.length === 0) return [];
    const sorted = [...raw].sort(
      (a: any, b: any) => (a.stampTime ?? 0) - (b.stampTime ?? 0)
    );
    const last = sorted.slice(-24).reverse();
    return last.map((item: any, index: number) => {
      const ketQua = roadToResultVN(item?.road);
      const rk = getRoundStorageKey(item);
      const duDoan =
        rk && roundPredictionByKey.has(rk)
          ? roundPredictionByKey.get(rk)!
          : "—";
      const danhGia = evaluateDanhGia(duDoan, ketQua);
      return {
        key: `${getSessionDisplayId(item, index)}-${index}`,
        sessionId: getSessionDisplayId(item, index),
        duDoan,
        ketQua,
        danhGia,
        stampTime: item?.stampTime as number | undefined,
      };
    });
  }, [dataRoom?.totalRound, roundPredictionByKey]);

  const ptbCounts = useMemo(
    () => countPlayerTieBanker(dataRoom?.totalRound),
    [dataRoom?.totalRound]
  );

  return (
    <div className="page-with-header">
      <Header setIsShowLogout={() => setIsShowLogout(true)} />
      <HomeMarquee className="home-marquee--tight home-marquee--lobby" />
      <ModalConfirmLogout
        isShowLogout={isShowLogout}
        setIsShowLogout={() => {
          setIsShowLogout(false);
        }}
      />

      <div className="room-cyber-page">
        <div className="room-cyber-shell">
          <div className="room-cyber-top">
            <h1 className="room-cyber-title">BÀN BACCARAT {tableTitle}</h1>
            <div className="room-cyber-status">
              <span>SEVER:</span>
              <span className="room-cyber-status__value">{serverLabel}</span>
              <span className="room-cyber-status__sep">|</span>
              <span>STATUS:</span>
              <span className="room-cyber-status__online">ONLINE</span>
            </div>
            <button
              type="button"
              className="room-cyber-back"
              onClick={() => navigate("/casino/lobby")}
            >
              <span className="room-cyber-back__chevrons" aria-hidden>
                &laquo;&laquo;
              </span>
              BACK
            </button>
          </div>

          {!loading && (
            <div className="room-cyber-board">
              <div className="room-cyber-topzone">
                <section className="room-panel room-topzone__left">
                  <h3 className="room-panel__title">NHẬT KÝ HỆ THỐNG</h3>
                  <div className="room-log">
                    {systemLogItems.map((log, index) => (
                      <p className="room-log__line" key={`${log.time}-${index}`}>
                        <span>[{log.time}]</span> {log.message}
                      </p>
                    ))}
                  </div>
                </section>

                <section className="room-panel room-topzone__center-top room-topzone__center-top--ai">
                  <div className="room-ai-grid">
                    <div className="room-ai-panel room-ai-panel--player">
                      <h3 className="room-ai-panel__title">AI DỰ ĐOÁN ĐIỂM PLAYER</h3>
                      <div className="room-ai-column">
                        {playerSlots.map((item, idx) => (
                          <button
                            key={`left-${item.key}`}
                            type="button"
                            className={`room-ai-row ${
                              selectedKey === item.key ? "is-active" : ""
                            }`}
                            onClick={() => setSelectedKey(item.key)}
                          >
                            <span>ĐIỂM {idx}</span>
                            <span>{item.forecast}%</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="room-ai-vs">
                      <img
                        src={getAssetUrl("/assets/image-vs.png")}
                        alt="VS"
                        className="room-ai-vs__image"
                      />
                    </div>
                    <div className="room-ai-panel room-ai-panel--banker">
                      <h3 className="room-ai-panel__title room-ai-panel__title--banker">
                        AI DỰ ĐOÁN ĐIỂM BANKER
                      </h3>
                      <div className="room-ai-column">
                        {bankerSlots.map((item, idx) => (
                          <button
                            key={`right-${item.key}`}
                            type="button"
                            className={`room-ai-row room-ai-row--banker ${
                              selectedKey === item.key ? "is-active" : ""
                            }`}
                            onClick={() => setSelectedKey(item.key)}
                          >
                            <span>ĐIỂM {idx}</span>
                            <span>{item.forecast}%</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="room-panel room-topzone__right">
                  <h3 className="room-panel__title room-panel__title--yellow">
                    BẢNG XÂM NHẬP GIẢI MÃ
                  </h3>
                  <div className="room-log room-log--decode">
                    {decodeItems.map((log, index) => (
                      <p className="room-log__line" key={`${log.time}-d-${index}`}>
                        <span>[{log.time}]</span> {log.message}
                      </p>
                    ))}
                  </div>
                </section>

                <section className="room-panel room-forecast room-topzone__center-bottom">
                  <div className="room-forecast__card">
                    <div className="room-forecast__content">
                    <div className="room-forecast__col room-forecast__col--left">
                      <div
                        className={`room-forecast__symbol ${
                          selectedWinner === "P"
                            ? "room-forecast__symbol--player"
                            : "room-forecast__symbol--banker"
                        }`}
                      >
                        <img
                          src={getAssetUrl(
                            selectedWinner === "P"
                              ? "/assets/casino/symbol_p.png"
                              : "/assets/casino/symbol_b.png"
                          )}
                          alt={selectedWinner === "P" ? "PLAYER" : "BANKER"}
                        />
                      </div>
                    </div>
                    <div className="room-forecast__col room-forecast__col--center">
                      <div className="room-forecast__text">
                        <h3 className="room-forecast__heading">
                          DỰ ĐOÁN VÁN TIẾP THEO
                        </h3>
                        <h2
                          className={
                            selectedWinner === "P"
                              ? "room-forecast__hero room-forecast__hero--player"
                              : "room-forecast__hero room-forecast__hero--banker"
                          }
                        >
                          {selectedWinner === "P" ? "PLAYER" : "BANKER"}
                        </h2>
                        <div className="room-forecast__ptb" aria-label="Tổng Player / Hòa / Banker">
                          <div className="room-forecast__ptb-col room-forecast__ptb-col--player">
                            <span className="room-forecast__ptb-line">
                              <span className="room-forecast__ptb-num">
                                {ptbCounts.player}
                              </span>
                              <span className="room-forecast__ptb-label">
                                PLAYER
                              </span>
                            </span>
                          </div>
                          <div className="room-forecast__ptb-col room-forecast__ptb-col--tie">
                            <span className="room-forecast__ptb-line">
                              <span className="room-forecast__ptb-num">
                                {ptbCounts.tie}
                              </span>
                              <span className="room-forecast__ptb-label">HÒA</span>
                            </span>
                          </div>
                          <div className="room-forecast__ptb-col room-forecast__ptb-col--banker">
                            <span className="room-forecast__ptb-line">
                              <span className="room-forecast__ptb-num">
                                {ptbCounts.banker}
                              </span>
                              <span className="room-forecast__ptb-label">
                                BANKER
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="room-forecast__col room-forecast__col--right">
                      <div
                        className="room-forecast__percent"
                        style={{
                          backgroundImage: `url(${getAssetUrl(
                            "/assets/bg-percent-result.png"
                          )})`,
                        }}
                      >
                        <span>{selectedForecast}%</span>
                      </div>
                    </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="room-cyber-row room-cyber-row--bottom">
                <section className="room-panel room-panel--history">
                  <div className="room-history__head">
                    <h3 className="room-history__title">
                      <span className="room-history__chev">&gt;&gt;</span> LỊCH SỬ
                      PHIÊN
                    </h3>
                    <span className="room-history__clock" title="Giờ hệ thống (VN)">
                      {liveClock}
                    </span>
                  </div>
                  <div className="room-history">
                    <table>
                      <thead>
                        <tr>
                          <th>PHIÊN</th>
                          <th>DỰ ĐOÁN</th>
                          <th>KẾT QUẢ</th>
                          <th>ĐÁNH GIÁ</th>
                          <th>THỜI GIAN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyItems.map((item) => (
                          <tr key={item.key}>
                            <td className="room-history__session">
                              {item.sessionId}
                            </td>
                            <td>
                              <span
                                className={`room-pill ${pillClassForSide(
                                  item.duDoan
                                )}`}
                              >
                                {item.duDoan}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`room-pill ${pillClassForSide(
                                  item.ketQua
                                )}`}
                              >
                                {item.ketQua}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`room-pill ${pillClassForDanhGia(
                                  item.danhGia
                                )}`}
                              >
                                {item.danhGia}
                              </span>
                            </td>
                            <td className="room-history__time">
                              {item.stampTime
                                ? formatLogTime(item.stampTime)
                                : liveClock}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="room-panel room-panel--cau-nhat">
                  <h3 className="room-panel__title">BẢNG CẦU NHẬT</h3>
                  <ResultTable tableData={dataRoom?.totalRound} />
                </section>

                <section className="room-panel room-panel--cau-lon">
                  <h3 className="room-panel__title">BẢNG CẦU LỚN</h3>
                  <BigRoadBoard tableData={dataRoom?.totalRound} />
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbyRoom;
