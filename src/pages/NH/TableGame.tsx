import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWindowWidth } from "../../hooks/useWindowWidth";
import ModalConfirmLogout from "../../components/ModalConfirmLogout";
import Header from "../../components/Header";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

const TableGameNew = () => {
  const navigate = useNavigate();
  const params = useParams();
  const tableRoomParam = params?.room;
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user_info") || "null");
    } catch {
      return null;
    }
  }, []);

  const [userCoins, setUserCoins] = useState<number>(userInfo?.coins ?? 0);
  const [isShowLogout, setIsShowLogout] = useState(false);
  const gameImg: string = (localStorage.getItem("title_img") || "/assets/phantichchitiet.gif") as string;
  const [gameTitle, setGameTitle] = useState<string>("THỢ SĂN CÁ MẬP");
  const winPercent = parseInt(localStorage.getItem("win_percent") || "90");

  const [points, setPoints] = useState<string>("");
  const [isHackPopupOpen, setIsHackPopupOpen] = useState(false);
  const [hackBalance, setHackBalance] = useState<string>("0");
  const [hackPopupMode, setHackPopupMode] = useState<"input" | "loading">("input");
  const [hackProgress, setHackProgress] = useState<number>(0);
  const [hackCapitalLabel, setHackCapitalLabel] = useState<string>("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [isHackBtnHovered, setIsHackBtnHovered] = useState(false);
  const [isVipPopupOpen, setIsVipPopupOpen] = useState(false);
  const [vipRecommendBet, setVipRecommendBet] = useState<string>("8K");
  const [vipPctBig, setVipPctBig] = useState<number>(88);
  const [vipPctSuper, setVipPctSuper] = useState<number>(88);
  const [vipPctUltra, setVipPctUltra] = useState<number>(92);
  const [isVipFeatureCharging, setIsVipFeatureCharging] = useState(false);
  const [isVipHackPopupStarting, setIsVipHackPopupStarting] = useState(false);
  const [vipHackActive, setVipHackActive] = useState(false);
  const [vipHackUiVisible, setVipHackUiVisible] = useState(false);
  const [vipHackEndsAtMs, setVipHackEndsAtMs] = useState<number | null>(null);
  const [vipHackRemainingSec, setVipHackRemainingSec] = useState<number>(0);
  const [manualValues, setManualValues] = useState({ rounds: 0, minBet: "0" });
  const [autoValues, setAutoValues] = useState({ rounds: 0, minBet: "0" });
  const [timeSlotText, setTimeSlotText] = useState(">Chưa có dữ liệu");
  const hackProgressTimerRef = useRef<number | null>(null);
  const hackRoundedValueRef = useRef<number | null>(null);
  const vipHackUiTimerRef = useRef<number | null>(null);

  const ww = useWindowWidth();
  const isNarrow = ww <= 430;
  const isMobileUi = ww <= 640;

  useEffect(() => {
    const raw = localStorage.getItem("user_info");
    if (raw) {
      try {
        setUserCoins(JSON.parse(raw)?.coins ?? 0);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const titleFromStorage = localStorage.getItem("title_text");
    if (titleFromStorage) setGameTitle(titleFromStorage);
  }, [tableRoomParam]);

  useEffect(() => {
    Swal.fire({
      html: `<div style="padding: 18px; color:white; font-family: 'Courier New', monospace;">Đang tải dữ liệu...</div>`,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      timer: 1200,
      background: "rgba(0,0,0,0.85)",
    });
  }, []);

  const deductCoins = async (amount: number = 1, action: string = "PLAY_GAME") => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return true; // không chặn luồng khi dev chưa login
      const res = await axios.post(
        `${process.env.REACT_APP_URL_API}/users/subtract-coins-for-action`,
        { amount, action },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      const newCoins = res.data?.coins ?? userCoins;
      setUserCoins(newCoins);
      const raw = localStorage.getItem("user_info");
      if (raw) {
        const u = JSON.parse(raw); u.coins = newCoins; localStorage.setItem("user_info", JSON.stringify(u));
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const jitter = (value: number, percent: number) => {
    const spread = value * percent;
    return value + (Math.random() * 2 - 1) * spread;
  };

  // Gợi ý cho nổ hũ: quay mồi ngắn + min thấp, auto dài hơn + min vừa phải.
  // Tránh scale tuyến tính theo điểm nhập để không ra thông số quá đà.
  const generateSpinSuggestions = (
    target: number,
    coins: number,
    strategyHint?: "manual" | "auto"
  ) => {
    const safeTarget = Math.max(target, 10);
    const bankroll = Math.max(coins, safeTarget * 8, 200);
    const targetPressure = safeTarget / bankroll;

    // Nếu mục tiêu cao hơn sức vốn => ép về cấu hình bảo toàn vốn.
    const isConservative = targetPressure > 0.2;

    let manualRoundsRange: [number, number];
    let autoRoundsRange: [number, number];
    let manualRatio: number;
    let autoRatio: number;

    if (safeTarget <= 300) {
      manualRoundsRange = [8, 16];
      autoRoundsRange = [24, 42];
      manualRatio = 0.018;
      autoRatio = 0.028;
    } else if (safeTarget <= 1500) {
      manualRoundsRange = [12, 20];
      autoRoundsRange = [32, 56];
      manualRatio = 0.014;
      autoRatio = 0.022;
    } else if (safeTarget <= 5000) {
      manualRoundsRange = [16, 26];
      autoRoundsRange = [42, 72];
      manualRatio = 0.011;
      autoRatio = 0.018;
    } else {
      manualRoundsRange = [20, 32];
      autoRoundsRange = [52, 90];
      manualRatio = 0.009;
      autoRatio = 0.015;
    }

    if (isConservative) {
      manualRoundsRange = [manualRoundsRange[0] + 2, manualRoundsRange[1] + 4];
      autoRoundsRange = [autoRoundsRange[0] + 6, autoRoundsRange[1] + 8];
      manualRatio *= 0.82;
      autoRatio *= 0.86;
    }

    const manualRounds = randomInt(manualRoundsRange[0], manualRoundsRange[1]);
    let autoRounds = randomInt(autoRoundsRange[0], autoRoundsRange[1]);

    // Bias cho mục tiêu: "mồi" thì ưu tiên manual hơn, "auto" thì ưu tiên auto hơn.
    if (strategyHint === "manual") {
      // Đảm bảo auto < manual + 10 để buildTimeSlotText ra "ưu tiên mồi".
      autoRounds = Math.max(1, manualRounds + randomInt(-10, 5));
    } else if (strategyHint === "auto") {
      // Đảm bảo auto >= manual + 10 để buildTimeSlotText ra "ưu tiên auto".
      autoRounds = manualRounds + 10 + randomInt(0, 12);
    }

    const manualMinRaw = jitter(safeTarget * manualRatio, 0.15);
    const autoMinRaw = jitter(safeTarget * autoRatio, 0.18);

    // Giới hạn mức min theo vốn để không bị "đuối xu" quá nhanh.
    const manualMin = Math.floor(clamp(manualMinRaw, 1, bankroll * 0.03));
    const autoMin = Math.floor(clamp(Math.max(autoMinRaw, manualMin * 1.15), 1, bankroll * 0.06));

    return {
      manual: { rounds: manualRounds, min: manualMin },
      auto: { rounds: autoRounds, min: autoMin },
    };
  };

  const formatHourMinute = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const buildTimeSlotText = (manualRounds: number, autoRounds: number) => {
    const now = new Date();
    const startDelay = randomInt(1, 4); // bắt đầu sau 1-4 phút
    const strategyIsAuto = autoRounds >= manualRounds + 10;
    const duration = strategyIsAuto ? randomInt(18, 25) : randomInt(12, 18);

    const start = new Date(now.getTime() + startDelay * 60 * 1000);
    const end = new Date(start.getTime() + duration * 60 * 1000);
    const strategy = strategyIsAuto ? "ưu tiên auto" : "ưu tiên mồi";

    return `>${formatHourMinute(start)} - ${formatHourMinute(end)} (${strategy})`;
  };

  // Actions
  const handleStart = async (
    targetPoints?: number,
    tokenCost: number = 1,
    strategyHint?: "manual" | "auto"
  ) => {
    const inputRaw =
      targetPoints !== undefined ? String(targetPoints) : points.trim();
    if (!inputRaw) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu dữ liệu",
        text: "Vui lòng nhập điểm trước khi bấm BẮT ĐẦU PHÂN TÍCH.",
        confirmButtonText: "Đã hiểu",
      });
      return;
    }

    const input = parseInt(inputRaw);
    if (!input || input <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Điểm chưa hợp lệ",
        text: "Điểm phải lớn hơn 0.",
        confirmButtonText: "Đã hiểu",
      });
      return;
    }
    
    // Nếu tokenCost <= 0 thì bỏ qua trừ xu (dùng cho chế độ hack VIP).
    if (tokenCost > 0) {
      // Check if user has enough coins
      if (userCoins < tokenCost) {
        showInsufficientXuModal(tokenCost);
        return;
      }

      // Deduct tokenCost xu
      const ok = await deductCoins(tokenCost, "SPIN_START");
      if (!ok) {
        showInsufficientXuModal(tokenCost);
        return;
      }
    }
    
    setIsSpinning(true);
    
    const suggestion = generateSpinSuggestions(input, userCoins, strategyHint);
    
    const manualBetFormatted = suggestion.manual.min >= 1000
      ? `${Math.floor(suggestion.manual.min / 1000)}K`
      : `${suggestion.manual.min}`;
    
    const autoBetFormatted = suggestion.auto.min >= 1000
      ? `${Math.floor(suggestion.auto.min / 1000)}K`
      : `${suggestion.auto.min}`;
    
    setManualValues({ 
      rounds: suggestion.manual.rounds, 
      minBet: manualBetFormatted 
    });
    setAutoValues({ 
      rounds: suggestion.auto.rounds, 
      minBet: autoBetFormatted 
    });
    setTimeSlotText(buildTimeSlotText(suggestion.manual.rounds, suggestion.auto.rounds));
    setTimeout(() => setIsSpinning(false), 250);
  };

  const showInsufficientXuModal = (requiredAmount: number = 1) => {
    // Create modal element
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(8px);
      animation: modalFadeIn 0.3s ease-out;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: 
        radial-gradient(circle at 30% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 70% 80%, rgba(255, 235, 59, 0.05) 0%, transparent 50%),
        linear-gradient(135deg, 
          rgba(26, 26, 46, 0.95) 0%, 
          rgba(22, 33, 62, 0.98) 25%,
          rgba(15, 52, 96, 0.95) 50%,
          rgba(22, 33, 62, 0.98) 75%,
          rgba(26, 26, 46, 0.95) 100%);
      border: 2px solid #ff6b6b;
      border-radius: 25px;
      padding: 35px;
      text-align: center;
      color: white;
      max-width: 420px;
      width: 90%;
      box-shadow: 
        0 0 40px rgba(255, 107, 107, 0.4),
        0 0 80px rgba(255, 235, 59, 0.2),
        0 20px 60px rgba(0, 0, 0, 0.5),
        inset 0 0 30px rgba(255, 107, 107, 0.1);
      position: relative;
      animation: modalSlideIn 0.4s ease-out;
      font-family: 'Courier New', monospace;
    `;

    modalContent.innerHTML = `
      <style>
        @keyframes modalFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes modalSlideIn {
          0% { 
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
            filter: blur(5px);
          }
          100% { 
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(255, 107, 107, 0.5); }
          50% { text-shadow: 0 0 20px rgba(255, 107, 107, 0.8); }
        }
      </style>
      
      <div style="display: flex; align-items: center; margin-bottom: 25px; animation: textGlow 2s ease-in-out infinite;">
        <div style="
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #ffeb3b, #ffc107);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20px;
          font-size: 28px;
          color: #000;
          font-weight: bold;
          box-shadow: 
            0 0 20px rgba(255, 235, 59, 0.6),
            0 0 40px rgba(255, 193, 7, 0.3);
          animation: iconPulse 1.5s ease-in-out infinite;
          border: 2px solid rgba(255, 255, 255, 0.3);
        ">!</div>
        <h2 style="
          margin: 0; 
          color: #ff6b6b; 
          font-size: 26px; 
          font-weight: 900;
          text-shadow: 
            0 0 15px rgba(255, 107, 107, 0.8),
            0 0 25px rgba(255, 107, 107, 0.5);
          letter-spacing: 2px;
          text-transform: uppercase;
        ">KHÔNG ĐỦ XU!</h2>
      </div>
      
      <div style="margin-bottom: 20px; font-size: 16px;">
        <div style="
          margin-bottom: 12px; 
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        ">
          <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">SỐ XU HIỆN TẠI: </span>
          <span style="
            color: #ffeb3b; 
            font-weight: bold; 
            font-size: 20px;
            text-shadow: 0 0 10px rgba(255, 235, 59, 0.6);
          ">${userCoins} XU</span>
        </div>
        <div style="
          margin-bottom: 12px; 
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        ">
          <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">YÊU CẦU TỐI THIỂU: </span>
          <span style="
            color: #ffeb3b; 
            font-weight: bold; 
            font-size: 20px;
            text-shadow: 0 0 10px rgba(255, 235, 59, 0.6);
          ">${requiredAmount} XU</span>
        </div>
      </div>
      
      <div onclick="window.open('https://t.me/congnghemoi668', '_blank')" style="
        margin-bottom: 25px; 
        font-size: 14px; 
        color: #64b5f6;
        padding: 10px 15px;
        background: rgba(100, 181, 246, 0.1);
        border-radius: 4px;
        border: 1px solid rgba(100, 181, 246, 0.3);
        text-shadow: 0 0 10px rgba(100, 181, 246, 0.5);
        letter-spacing: 1px;
        cursor: pointer;
        transition: all 0.3s ease;
      " onmouseover="
        this.style.backgroundColor='rgba(100, 181, 246, 0.2)';
        this.style.borderColor='rgba(100, 181, 246, 0.5)';
        this.style.transform='scale(1.02)';
      " onmouseout="
        this.style.backgroundColor='rgba(100, 181, 246, 0.1)';
        this.style.borderColor='rgba(100, 181, 246, 0.3)';
        this.style.transform='scale(1)';
      ">
        » LIÊN HỆ ADMIN ĐỂ NẠP XU «
      </div>
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: linear-gradient(45deg, #ff6b6b, #ee5a24);
        border: none;
        border-radius: 12px;
        padding: 14px 35px;
        color: white;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 
          0 0 20px rgba(255, 107, 107, 0.4),
          0 4px 15px rgba(0, 0, 0, 0.3);
        text-transform: uppercase;
        letter-spacing: 1px;
        font-family: 'Courier New', monospace;
      " onmouseover="
        this.style.transform='translateY(-2px)';
        this.style.boxShadow='0 0 30px rgba(255, 107, 107, 0.6), 0 6px 20px rgba(0, 0, 0, 0.4)';
      " onmouseout="
        this.style.transform='translateY(0)';
        this.style.boxShadow='0 0 20px rgba(255, 107, 107, 0.4), 0 4px 15px rgba(0, 0, 0, 0.3)';
      ">
        ĐÓNG
      </button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  };

  const openHackPopup = () => {
    // Yêu cầu: bật popup lên thì ô input xóa trắng
    setHackBalance("");
    setHackPopupMode("input");
    setHackProgress(0);
    setHackCapitalLabel("");
    setIsHackPopupOpen(true);
  };

  const closeHackPopup = () => {
    setIsHackPopupOpen(false);
    setHackPopupMode("input");
    setHackProgress(0);
    setHackCapitalLabel("");
    hackRoundedValueRef.current = null;
    if (hackProgressTimerRef.current != null) {
      window.clearInterval(hackProgressTimerRef.current);
      hackProgressTimerRef.current = null;
    }
  };

  const openVipPopup = () => {
    // Tỉ lệ mức cược: 8K nhiều nhất, sau đó 16K, 32K, 64K giảm dần
    const betOptions = [8, 16, 32, 64] as const;
    const betWeights = [60, 20, 12, 8] as const; // tổng 100
    const r = Math.random() * 100;
    let acc = 0;
    let pick = 8;
    for (let i = 0; i < betOptions.length; i++) {
      acc += betWeights[i];
      if (r <= acc) {
        pick = betOptions[i];
        break;
      }
    }
    setVipRecommendBet(`${pick}K`);

    // Theo yêu cầu:
    // - random 85 - 95%
    // - thắng lớn < thắng siêu lớn < thắng cực lớn (cực lớn là lớn nhất)
    // Để đảm bảo strict tăng trong khi giới hạn 95%, cho thắng lớn tối đa 93.
    const big = randomInt(85, 93);
    const superPct = randomInt(big + 1, 94);
    const ultraPct = randomInt(superPct + 1, 95);

    setVipPctBig(big);
    setVipPctSuper(superPct);
    setVipPctUltra(ultraPct);

    setIsVipPopupOpen(true);
  };

  const closeVipPopup = () => setIsVipPopupOpen(false);

  const handleVipFeatureClick = async () => {
    if (isVipHackPopupStarting) return;
    if (isVipFeatureCharging) return;

    if (userCoins < 20) {
      showInsufficientXuModal(20);
      return;
    }

    setIsVipFeatureCharging(true);
    const ok = await deductCoins(20, "VIP_FEATURE_OPEN");
    setIsVipFeatureCharging(false);
    if (!ok) {
      showInsufficientXuModal(20);
      return;
    }

    openVipPopup();
  };

  const formatMMSS = (totalSeconds: number) => {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const parseVipBetToNumber = (label: string) => {
    // Ví dụ: "8K" -> 8000
    const s = String(label ?? "").trim().toUpperCase();
    if (!s) return 0;
    if (s.endsWith("K")) {
      const n = parseFloat(s.slice(0, -1));
      return Number.isFinite(n) ? Math.floor(n * 1000) : 0;
    }
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : 0;
  };

  const formatKBet = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return "0";
    if (value >= 1000) return `${Math.floor(value / 1000)}K`;
    return `${Math.floor(value)}`;
  };

  const startVipHackNow = () => {
    if (vipHackActive || isVipHackPopupStarting) return;

    // VIP 2p: random mức 8K / 16K / 32K, rồi nhân 10 để seed tính vòng + khung giờ.
    const vipBetPool = ["8K", "16K", "32K"] as const;
    const selectedVipBet = vipBetPool[randomInt(0, vipBetPool.length - 1)];
    setVipRecommendBet(selectedVipBet);
    const selectedVipBetNumber = parseVipBetToNumber(selectedVipBet); // 8000/16000/32000
    const vipCalcSeed = Math.max(10, Math.floor(selectedVipBetNumber / 1000) * 10); // 80/160/320
    const vipSuggestion = generateSpinSuggestions(vipCalcSeed, userCoins, "auto");

    // Set lại kết quả hiển thị theo seed VIP mới.
    const manualMin = Math.max(selectedVipBetNumber, vipSuggestion.manual.min);
    const autoMin = Math.max(
      Math.floor(selectedVipBetNumber * 1.25),
      vipSuggestion.auto.min
    );
    setManualValues({
      rounds: vipSuggestion.manual.rounds,
      minBet: formatKBet(manualMin),
    });
    setAutoValues({
      rounds: vipSuggestion.auto.rounds,
      minBet: formatKBet(autoMin),
    });
    setTimeSlotText(
      buildTimeSlotText(vipSuggestion.manual.rounds, vipSuggestion.auto.rounds)
    );

    // "2p trở xuống": random 60..120 giây
    const durationSec = Math.floor(60 + Math.random() * 61);

    setIsVipHackPopupStarting(true);
    setVipHackActive(true);
    setVipHackUiVisible(true);
    setVipHackRemainingSec(durationSec);
    setVipHackEndsAtMs(Date.now() + durationSec * 1000);

    // Đóng popup hack đang có để tránh che UI / xung đột
    setIsHackPopupOpen(false);
    setHackPopupMode("input");
    setHackProgress(0);
    setHackCapitalLabel("");
    hackRoundedValueRef.current = null;
    if (hackProgressTimerRef.current != null) {
      window.clearInterval(hackProgressTimerRef.current);
      hackProgressTimerRef.current = null;
    }

    // Bấm xong chạy ngay: đóng popup VIP liền, không dùng setTimeout 3s nữa
    setIsVipPopupOpen(false);
    setIsVipHackPopupStarting(false);
  };

  const stopVipHackNow = () => {
    if (!vipHackActive && !isVipHackPopupStarting) return;

    if (vipHackUiTimerRef.current != null) {
      window.clearInterval(vipHackUiTimerRef.current);
      vipHackUiTimerRef.current = null;
    }

    setVipHackActive(false);
    setVipHackUiVisible(false);
    setVipHackEndsAtMs(null);
    setVipHackRemainingSec(0);
    setIsVipHackPopupStarting(false);
  };

  useEffect(() => {
    if (!vipHackActive) return;
    if (vipHackEndsAtMs == null) return;

    if (vipHackUiTimerRef.current != null) {
      window.clearInterval(vipHackUiTimerRef.current);
      vipHackUiTimerRef.current = null;
    }

    vipHackUiTimerRef.current = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((vipHackEndsAtMs - Date.now()) / 1000)
      );
      setVipHackRemainingSec(remaining);

      if (remaining <= 0) {
        if (vipHackUiTimerRef.current != null) {
          window.clearInterval(vipHackUiTimerRef.current);
          vipHackUiTimerRef.current = null;
        }
        setVipHackActive(false);
        setVipHackUiVisible(false);
        setVipHackEndsAtMs(null);
        setVipHackRemainingSec(0);
      }
    }, 200);

    return () => {
      if (vipHackUiTimerRef.current != null) {
        window.clearInterval(vipHackUiTimerRef.current);
        vipHackUiTimerRef.current = null;
      }
    };
  }, [vipHackActive, vipHackEndsAtMs]);

  const confirmHackPopup = async () => {
    if (isSpinning) return;

    const raw = hackBalance.trim();
    const value = parseInt(raw, 10);
    // Bỏ 3 số sau (vd 123000 -> 123, 124345 -> 124)
    const roundedValue = Number.isFinite(value) ? Math.floor(value / 1000) : NaN;

    if (!raw || Number.isNaN(roundedValue) || roundedValue <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Dữ liệu chưa hợp lệ",
        text: "Giá trị phải lớn hơn hoặc bằng 1000.",
        confirmButtonText: "Đã hiểu",
      });
      return;
    }

    const displayCapital = Math.floor(value / 1000) * 1000;

    setHackPopupMode("loading");
    setHackCapitalLabel(
      Number.isFinite(displayCapital) ? displayCapital.toLocaleString("vi-VN") : ""
    );
    setHackProgress(0);
    hackRoundedValueRef.current = roundedValue;

    if (hackProgressTimerRef.current != null) {
      window.clearInterval(hackProgressTimerRef.current);
      hackProgressTimerRef.current = null;
    }

    // Chạy thanh tiến trình UI (mô phỏng "đang phân tích" như ảnh)
    hackProgressTimerRef.current = window.setInterval(() => {
      setHackProgress((p) => {
        const jump = 2 + Math.random() * 6;
        const next = Math.min(100, Math.floor(p + jump));
        return next;
      });
    }, 120);

    // Chạy logic trừ token + tính toán song song
    // Để đúng yêu cầu: phải chạy xong màn "đang phân tích" mới bắt đầu cập nhật kết quả.

    // Đóng popup ngoài cùng trong giai đoạn loading (để không bị "thừa popup")
    setIsHackPopupOpen(false);
  };

  useEffect(() => {
    if (hackPopupMode !== "loading") return;
    if (hackProgress < 100) return;

    if (hackProgressTimerRef.current != null) {
      window.clearInterval(hackProgressTimerRef.current);
      hackProgressTimerRef.current = null;
    }

    const rounded = hackRoundedValueRef.current;
    if (rounded == null) return;

    // Chờ handleStart cập nhật xong kết quả (quay mồi/quay auto) thì mới đóng popup
    void (async () => {
      await handleStart(rounded, 10);
      closeHackPopup();
    })();
  }, [hackPopupMode, hackProgress]);

  return (
    <div
      className="container-fluid lobby-bg position-relative mx-auto mb-5 max-w-screen-xl"
      style={{
        position: "relative",
        minHeight: "100vh",
        paddingLeft: "max(0px, env(safe-area-inset-left, 0px))",
        paddingRight: "max(0px, env(safe-area-inset-right, 0px))",
      }}
    >
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
          backgroundSize: "contain",
          backgroundRepeat: "repeat",
          backgroundPosition: "top"
        }}
      >
        <source
          src={isNarrow ? "/assets/bg-mb.mp4" : "/assets/bg-pc.mp4"}
          type="video/mp4"
        />
      </video>

      <Header setIsShowLogout={() => setIsShowLogout(true)} />

      {/* Khung chính duy nhất */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))",
          marginTop: isMobileUi ? "4.25rem" : "5rem",
          paddingLeft: "max(8px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(8px, env(safe-area-inset-right, 0px))",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "min(475px, calc(100vw - 16px))",
            height: isMobileUi ? "auto" : 755,
            minHeight: isMobileUi ? 520 : 755,
            backgroundImage: "url('/assets/bg-result-nohu.png')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            padding: isNarrow ? "12px 14px 14px" : "14px 24px",
            color: "#fff",
            boxSizing: "border-box",
          }}
        >
          {/* Nút quay lại nằm cạnh trái modal */}
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/NH"))}
            aria-label="Quay lại"
            style={{
              position: "absolute",
              left: isMobileUi ? 0 : -98,
              top: isMobileUi ? -40 : -44,
              transform: "none",
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 0,
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              zIndex: 5,
              cursor: "pointer",
            }}
          >
            <img src="/assets/arrow-icon.png" alt="arrow" style={{ width: 28, height: 28 }} />
            <span>Quay lại</span>
          </button>

          {/* Div 1: robot */}
          <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 8 }}>
            <img
              src="/assets/robot-result.gif"
              alt="robot"
              style={{
                width: "min(430px, 100%)",
                height: "auto",
                maxHeight: isNarrow ? 200 : 255,
                objectFit: "contain",
              }}
            />
          </div>

          {/* Div 2: logo + tên căn giữa dưới ảnh | khối loading/% bên phải */}
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
                onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/assets/nohu.gif")}
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
                    letterSpacing: "0%",
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
                    letterSpacing: "0%",
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
                {vipHackActive || vipHackUiVisible ? (
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
                        letterSpacing: 0.2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
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
                        letterSpacing: 0.2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <span>LATENCY:</span>
                      <span style={{ color: "#00FF6F" }}>
                        {`${Math.floor(12 + Math.random() * 9)}ms`}
                      </span>
                    </div>
                    <div
                      style={{
                        fontWeight: 900,
                        color: "#fff",
                        fontSize: isNarrow ? 13 : 16,
                        letterSpacing: 0.2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
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
                      src="/assets/loading.webm"
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
                    <div
                      style={{
                        position: "absolute",
                        right: isNarrow ? 48 : 36,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: isNarrow ? 20 : 24,
                        fontWeight: 900,
                        textShadow: "0 0 10px rgba(0,0,0,0.8)",
                      }}
                    >
                      {winPercent}%
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 4 ô button (2x2) - dùng nền bg-result, kích thước bằng nhau */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: isNarrow ? 8 : 12,
              marginTop: 12,
            }}
          >
            {/** Quay mồi */}
            <div
              style={{
                height: 82,
                backgroundImage: "url('/assets/bg-result-nohu.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                border: "2px solid rgba(0, 255, 225, 0.85)",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 0 14px rgba(0, 255, 225, 0.08)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.2 }}>
                Quay mồi
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: "#F7FF00",
                }}
              >
                {manualValues.rounds} vòng - Mức min {manualValues.minBet}
              </div>
            </div>

            {/** Quay Auto */}
            <div
              style={{
                height: 82,
                backgroundImage: "url('/assets/bg-result-nohu.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                border: "2px solid rgba(0, 255, 225, 0.85)",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 0 14px rgba(0, 255, 225, 0.08)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.2 }}>
                Quay Auto
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: "#F7FF00",
                }}
              >
                {autoValues.rounds} vòng - Mức min {autoValues.minBet}
              </div>
            </div>

            {/** KHUNG GIỜ */}
            <div
              style={{
                height: 82,
                backgroundImage: "url('/assets/bg-result-nohu.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                border: "2px solid rgba(0, 255, 225, 0.85)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontFamily: '"Source Code Pro", monospace',
                boxShadow: "0 0 14px rgba(0, 255, 225, 0.08)",
                padding: "0 8px",
              }}
            >
              <div style={{ lineHeight: 1.15, wordBreak: "break-word" }}>
                <div style={{ color: "#F7FF00", fontWeight: 800, fontSize: isNarrow ? 15 : 18 }}>
                  KHUNG GIỜ
                </div>
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

            {/** VIP FEATURE */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                void handleVipFeatureClick();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void handleVipFeatureClick();
                }
              }}
              style={{
                height: 82,
                backgroundImage: "url('/assets/bg-result-nohu.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                border: "2px solid rgba(0, 255, 225, 0.85)",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "0 0 14px rgba(0, 255, 225, 0.08)",
                padding: "18px 8px 0",
                textAlign: "center",
              }}
            >
              <img
                src="/assets/vip-icon.png"
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
              <div style={{ fontSize: 16, fontWeight: 900, color: "#00FFE1" }}>
                VIP FEATURE
              </div>
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
                  background: vipHackActive
                    ? "linear-gradient(90deg, #620000 0%, #FF4400 100%)"
                    : "linear-gradient(90deg, #003730 0%, #00B9A0 100%)",
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: 11,
                  letterSpacing: 0.3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isVipHackPopupStarting || isVipFeatureCharging ? "not-allowed" : "pointer",
                  border: vipHackActive ? "2px solid #FF4400" : "2px solid rgba(0,185,160,0.55)",
                  opacity: isVipHackPopupStarting || isVipFeatureCharging ? 0.65 : vipHackActive ? 1 : 0.75,
                  transition: "opacity 0.15s ease, background 0.15s ease",
                }}
              >
                {"\u003E"} {vipHackActive ? "KÍCH HOẠT LẠI" : "KÍCH HOẠT NGAY"} {"\u003C"}
              </button>
            </div>
          </div>

          {/* Div 6: HACK / Status */}
          {vipHackUiVisible ? (
            <div
              style={{
                marginTop: 12,
                width: "100%",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                padding: "0 14px",
                gap: 8,
                minHeight: 150,
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
                  letterSpacing: 0.5,
                }}
              >
                {formatMMSS(vipHackRemainingSec)}
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >

                <button
                  type="button"
                  disabled={isSpinning || vipHackRemainingSec <= 0}
                  onClick={stopVipHackNow}
                  style={{
                    width: "100%",
                    height: 42,
                    border: "none",
                    borderRadius: 14,
                    background: "#00472E",
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 0 18px rgba(0, 71, 46, 0.35)",
                  }}
                >
                  DỪNG HACK NGAY
                </button>
              </div>
            </div>
          ) : isVipHackPopupStarting || vipHackActive ? (
            // Khi VIP hack vừa bấm (trong giai đoạn chờ 3s), ẩn hẳn nút HACK (10TOKEN)
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
                padding: "0 14px",
                boxShadow: "0 0 22px rgba(0, 255, 225, 0.10)",
                border: "1px solid rgba(0,255,225,0.35)",
                background: "rgba(0,0,0,0.20)",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  color: "#00FFE1",
                  fontSize: isNarrow ? 15 : 16,
                  lineHeight: 1.1,
                  textShadow: "0 0 10px rgba(0,255,225,0.20)",
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
                  border: "1px solid rgba(0,255,225,0.25)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 10,
                    width: `${hackProgress}%`,
                    borderRadius: 999,
                    background:
                      "linear-gradient(90deg, #00ff7b 0%, #00ffd5 55%, #F7FF00 100%)",
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
                borderRadius: 14,
                background: "linear-gradient(90deg, #00ff7b 0%, #00ffd5 100%)",
                color: "#fff",
                fontSize: isNarrow ? 23 : 26,
                fontWeight: 900,
                letterSpacing: 0.5,
                cursor: isSpinning ? "not-allowed" : "pointer",
                opacity: isSpinning ? 0.7 : 1,
                boxShadow: "0 0 22px rgba(0, 255, 225, 0.22)",
                transition: "transform 0.15s ease, filter 0.15s ease",
                transform: isHackBtnHovered ? "translateY(2px)" : "translateY(0)",
                filter: isHackBtnHovered ? "brightness(0.75)" : "brightness(1)",
              }}
            >
              HACK (10TOKEN)
            </button>
          ) : (
            <div style={{ marginTop: 12, width: "100%", height: 56 }} />
          )}
        </div>
      </div>

      {isHackPopupOpen && hackPopupMode === "input" ? (
        <div
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && hackPopupMode === "input") closeHackPopup();
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10001,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(6px)",
            padding: 14,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{
              width: "min(430px, calc(100vw - 28px))",
              minHeight: isNarrow ? 150 : 265,
              height: isNarrow ? "auto" : 265,
              backgroundImage: "url('/assets/bg-result-nohu.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              borderRadius: 16,
              padding: isNarrow ? 14 : 16,
              boxShadow: "0 0 35px rgba(0, 255, 225, 0.18)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {hackPopupMode === "input" ? (
              <>
                {/* Item 1: Title */}
                <div
                  style={{
                    textAlign: "center",
                    fontSize: isNarrow ? 18 : 20,
                    fontWeight: 900,
                    color: "#F7FF00",
                    textShadow: "0 0 10px rgba(247,255,0,0.35)",
                    letterSpacing: 0.5,
                    marginBottom: -2,
                  }}
                >
                  NHẬP SỐ DƯ HIỆN TẠI
                </div>

                {/* Item 2: Input */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 44,
                    borderRadius: 10,
                    border: "1px solid rgba(0,255,225,0.55)",
                    background: "rgba(0,0,0,0.18)",
                    padding: "0 10px",
                    gap: 10,
                  }}
                >
                  <style>{`
                    /* Hide number spinners for the hack popup input only */
                    .hack-popup-number-input::-webkit-outer-spin-button,
                    .hack-popup-number-input::-webkit-inner-spin-button {
                      -webkit-appearance: none;
                      margin: 0;
                    }
                    .hack-popup-number-input {
                      -moz-appearance: textfield;
                      appearance: textfield;
                    }
                  `}</style>
                  <input
                    aria-label="Nhập số dư hiện tại"
                    inputMode="numeric"
                    type="text"
                    pattern="[0-9]*"
                    value={hackBalance}
                    onChange={(e) => {
                      const next = e.target.value.replace(/\D/g, "");
                      setHackBalance(next);
                    }}
                    onKeyDown={(e) => {
                      if (e.ctrlKey || e.metaKey || e.altKey) return;
                      const allowed = [
                        "Backspace",
                        "Delete",
                        "Tab",
                        "ArrowLeft",
                        "ArrowRight",
                        "Home",
                        "End",
                      ];
                      if (allowed.includes(e.key)) return;
                      if (!/^\d$/.test(e.key)) e.preventDefault();
                    }}
                    className="hack-popup-number-input"
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      textAlign: "center",
                      fontSize: isNarrow ? 22 : 24,
                      fontWeight: 900,
                      color: "#F7FF00",
                    }}
                  />
                  <div
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      color: "green",
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    vnd
                  </div>
                </div>

                {/* Item 3: Confirm button */}
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={confirmHackPopup}
                  style={{
                    width: "100%",
                    height: isNarrow ? 46 : 48,
                    border: "none",
                    borderRadius: 10,
                    background: "linear-gradient(90deg, #ff3b30 0%, #ee5a24 100%)",
                    color: "#fff",
                    fontSize: isNarrow ? 16 : 18,
                    fontWeight: 900,
                    letterSpacing: 0.5,
                    cursor: isSpinning ? "not-allowed" : "pointer",
                    boxShadow: "0 0 25px rgba(255, 59, 48, 0.25)",
                    opacity: isSpinning ? 0.75 : 1,
                  }}
                >
                  BẮT ĐẦU QUÉT (10 TOKEN)
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    color: "#00FFE1",
                    fontWeight: 900,
                    fontSize: isNarrow ? 13 : 14,
                    textShadow: "0 0 10px rgba(0,255,225,0.25)",
                    padding: "0 6px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginTop: -2,
                  }}
                >
                  Đang phân tích dữ liệu với mức vốn {hackCapitalLabel}...
                </div>

                <div
                  style={{
                    width: "100%",
                    height: 18,
                    borderRadius: 999,
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(0,255,225,0.25)",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 0 22px rgba(0,255,225,0.12)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -2,
                      left: 0,
                      height: 22,
                      width: `${hackProgress}%`,
                      borderRadius: 999,
                      background: "linear-gradient(90deg, #00ff7b 0%, #00ffd5 55%, #F7FF00 100%)",
                      boxShadow: "0 0 22px rgba(0,255,225,0.25)",
                      transition: "width 0.12s linear",
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {isVipPopupOpen ? (
        <div
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeVipPopup();
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10002,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(6px)",
            padding: 14,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{
              width: "min(430px, calc(100vw - 28px))",
              maxWidth: "100%",
              backgroundImage: "url('/assets/bg-result-nohu.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              borderRadius: 18,
              padding: isNarrow ? 14 : 16,
              boxShadow: "0 0 35px rgba(0,255,225,0.18)",
              position: "relative",
              color: "#fff",
            }}
          >
            <button
              type="button"
              onClick={closeVipPopup}
              aria-label="Đóng"
              style={{
                position: "absolute",
                top: 6,
                right: 10,
                width: 28,
                height: 28,
                borderRadius: 8,
                border: "1px solid rgba(0,255,225,0.25)",
                background: "rgba(0,0,0,0.35)",
                color: "#fff",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ×
            </button>

            {vipHackActive || isVipHackPopupStarting ? (
              null
            ) : null}

            <div
              style={{
                textAlign: "center",
                fontWeight: 900,
                letterSpacing: 0.5,
                color: "#F7FF00",
                fontSize: isNarrow ? 18 : 20,
                textShadow: "0 0 10px rgba(247,255,0,0.2)",
                marginTop: 6,
              }}
            >
              TỶ LỆ THẮNG LỚN
            </div>

            <div
              style={{
                marginTop: 6,
                textAlign: "center",
                fontWeight: 900,
                color: "#00FFE1",
                fontSize: isNarrow ? 14 : 15,
              }}
            >
              MỨC CƯỢC ĐỀ NGHỊ: {vipRecommendBet}
            </div>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: isNarrow ? 6 : 10,
              }}
            >
              <div
                style={{
                  borderRadius: 10,
                  border: "1px solid rgba(0,255,225,0.20)",
                  background: "rgba(0,0,0,0.40)",
                  padding: "10px 6px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: isNarrow ? 10 : 12, lineHeight: 1.2 }}>
                  THẮNG LỚN
                </div>
                <div
                  style={{
                    color: "#F7FF00",
                    fontWeight: 900,
                    fontSize: isNarrow ? 18 : 24,
                    marginTop: 4,
                  }}
                >
                  {vipPctBig}%
                </div>
              </div>

              <div
                style={{
                  borderRadius: 10,
                  border: "1px solid rgba(0,255,225,0.20)",
                  background: "rgba(0,0,0,0.40)",
                  padding: "10px 6px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: isNarrow ? 10 : 12, lineHeight: 1.2 }}>
                  THẮNG SIÊU LỚN
                </div>
                <div
                  style={{
                    color: "#F7FF00",
                    fontWeight: 900,
                    fontSize: isNarrow ? 18 : 24,
                    marginTop: 4,
                  }}
                >
                  {vipPctSuper}%
                </div>
              </div>

              <div
                style={{
                  borderRadius: 10,
                  border: "1px solid rgba(0,255,225,0.20)",
                  background: "rgba(0,0,0,0.40)",
                  padding: "10px 6px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: isNarrow ? 10 : 12, lineHeight: 1.2 }}>
                  THẮNG CỰC LỚN
                </div>
                <div
                  style={{
                    color: "#ff6b6b",
                    fontWeight: 900,
                    fontSize: isNarrow ? 18 : 24,
                    marginTop: 4,
                  }}
                >
                  {vipPctUltra}%
                </div>
              </div>
            </div>

          <button
            type="button"
            disabled={isVipHackPopupStarting || vipHackActive}
            onClick={startVipHackNow}
            style={{
              marginTop: 14,
              width: "100%",
              height: 54,
              border: "none",
              borderRadius: 14,
              background: "linear-gradient(90deg, #00ff7b 0%, #00ffd5 100%)",
              color: "#fff",
              fontWeight: 900,
              fontSize: isNarrow ? 18 : 20,
              boxShadow: "0 0 26px rgba(0,255,225,0.18)",
              cursor: isVipHackPopupStarting || vipHackActive ? "not-allowed" : "pointer",
              opacity: isVipHackPopupStarting || vipHackActive ? 0.8 : 1,
            }}
          >
            DÙNG HACK NGAY
          </button>
          </div>
        </div>
      ) : null}

      <ModalConfirmLogout
        isShowLogout={isShowLogout}
        setIsShowLogout={() => {
          setIsShowLogout(false);
        }}
      />
    </div>
  );
};

export default TableGameNew;
