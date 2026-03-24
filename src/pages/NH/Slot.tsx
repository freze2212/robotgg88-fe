import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from "sweetalert2";

import Header from "../../components/Header";
import ModalConfirmLogout from "../../components/ModalConfirmLogout";
import styles from './style.module.css';
import { getFormattedTime } from "../../utilities/axios.utilities";
import ProgressBar from '../NH/components/ProgressBar';

interface TableItem {
  time: string;
  percent: number;
  typeGame: string;
  name: string;
  showIcon?: string;
  _id: string;
}

const Slot = () => {
  const [isShowLogout, setIsShowLogout] = useState(false);
  const [tableList, setTableList] = useState<TableItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth <= 430 : false
  );
  const { room } = useParams();
  const currentTime = getFormattedTime();
  const [isLoading, setIsLoading] = useState(false);

  const MOBILE_BREAKPOINT = 430;
  const MOBILE_INITIAL_VISIBLE = 12;
  const DESKTOP_INITIAL_VISIBLE = 40;
  const MOBILE_STEP_VISIBLE = 12;
  const DESKTOP_STEP_VISIBLE = 40;

  const [visibleCount, setVisibleCount] = useState(
    typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT
      ? MOBILE_INITIAL_VISIBLE
      : DESKTOP_INITIAL_VISIBLE
  );

  const scrollTickingRef = useRef(false);

  // Bỏ dấu tiếng Việt (kể cả đ, ư, ơ, ă, â, ê, ô) để tìm dễ
  const normalizeString = (str: string) => {
    const s = str.toLowerCase();
    const from =
      "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ";
    const to =
      "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
    let out = "";
    for (let i = 0; i < s.length; i++) {
      const idx = from.indexOf(s[i]);
      out += idx >= 0 ? to[idx] : s[i];
    }
    return out.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Filter tableList based on search term
  const filteredTableList = tableList.filter((item) => {
    if (!searchTerm.trim()) return true;
    const normalizedTitle = normalizeString(item.name);
    const normalizedSearch = normalizeString(searchTerm.trim());
    return normalizedTitle.includes(normalizedSearch);
  });

  const visibleTableList = useMemo(() => {
    return filteredTableList.slice(0, visibleCount);
  }, [filteredTableList, visibleCount]);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 430);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Reset số lượng hiển thị khi đổi mobile/desktop.
  useEffect(() => {
    setVisibleCount((prev) =>
      Math.max(prev, isMobile ? MOBILE_INITIAL_VISIBLE : DESKTOP_INITIAL_VISIBLE)
    );
  }, [isMobile]);

  // Reset visibleCount sau khi user nhập search (giống FE: debounce nhẹ).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisibleCount(isMobile ? MOBILE_INITIAL_VISIBLE : DESKTOP_INITIAL_VISIBLE);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [searchTerm, isMobile]);

  // Infinite scroll: tăng dần số lượng item hiển thị khi scroll gần cuối trang
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTickingRef.current) return;
      scrollTickingRef.current = true;
      requestAnimationFrame(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold =
          document.body.offsetHeight - (isMobile ? 260 : 400);
        if (scrollPosition >= threshold) {
          setVisibleCount((prev) => {
            const maxVisible = filteredTableList.length || tableList.length;
            if (prev >= maxVisible) return prev;
            const step = isMobile ? MOBILE_STEP_VISIBLE : DESKTOP_STEP_VISIBLE;
            return Math.min(prev + step, maxVisible);
          });
        }
        scrollTickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredTableList.length, tableList.length, isMobile]);

  useEffect(() => {
    if (!isLoading) {
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

    const fetchTableList = async () => {
      try {
        const token = Cookies.get("access_token");
        const response = await axios.get(
          `${process.env.REACT_APP_URL_API_CASINO}/NH/tableList?typeGame=${room}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setTableList(response.data);
        if (response.data) {
          setTimeout(() => {
            setIsLoading(true);
            Swal.close();
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching table list:', error);
      }
    };

    fetchTableList();
    window.scrollTo(0, 0);
  }, [room]);

  localStorage.setItem("NH_PAGE", String(room));

  return (
    <div>
      <Header setIsShowLogout={() => setIsShowLogout(true)} />
      {isLoading && (
        <div className={`container-fluid lobby-bg position-relative mx-auto mb-5 max-w-screen-xl`}>
          <div className="container mx-auto">
            <div className="my-7">
              {/* Top: BACK + tiêu đề */}
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "stretch" : "center",
                  justifyContent: "space-between",
                  gap: isMobile ? 10 : 16,
                  marginBottom: 18,
                }}
              >
                <a
                  href="/NH"
                  className="text-white no-underline"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: isMobile ? "6px 10px" : "8px 16px",
                    background: "rgba(0,0,0,0.4)",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontSize: isMobile ? 12 : 14,
                    width: isMobile ? "fit-content" : 110,
                  }}
                >
                  <span style={{ fontSize: 18 }}>‹‹</span>
                  <span>BACK</span>
                </a>

                <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
                  <h1
                    style={{
                      margin: 0,
                      color: "#fff",
                      fontSize: isMobile ? "clamp(22px, 7vw, 30px)" : "clamp(28px, 5vw, 48px)",
                      fontWeight: 900,
                      textShadow:
                        "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,0,0,0.3)",
                      letterSpacing: 2,
                      fontFamily: '"Source Code Pro", monospace',
                    }}
                  >
                    {(room ?? "PG").toString().toUpperCase()} GAME
                  </h1>
                  {!isMobile && (
                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#fff",
                        fontSize: "clamp(12px, 3.5vw, 16px)",
                        fontWeight: 600,
                        letterSpacing: 2,
                        textShadow: "0 0 12px rgba(255,0,0,0.4)",
                        fontFamily: '"Source Code Pro", monospace',
                      }}
                    >
                      [ CÔNG NGHỆ AI ]
                    </p>
                  )}
                </div>

                {!isMobile && <div style={{ flex: "0 0 auto", width: 100 }} aria-hidden />}
              </div>

              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 18,
                  marginBottom: 14,
                }}
              >
                {["TẤT CẢ", "JACKPOT", "CHỌI"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    style={{
                      height: 34,
                      padding: "0 18px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.28)",
                      background: "rgba(0,0,0,0.35)",
                      color: "#fff",
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      cursor: "default",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Ô tìm kiếm + nút Tìm ngay */}
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  flexWrap: "nowrap",
                  alignItems: "stretch",
                  justifyContent: "center",
                  gap: 12,
                  maxWidth: isMobile ? "100%" : 560,
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    flex: isMobile ? "1 1 100%" : "1 1 280px",
                    minWidth: isMobile ? "100%" : 200,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 14,
                      color: "#00FFE1",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </span>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Tìm kiếm game..."
                    style={{
                      width: "100%",
                      height: isMobile ? 40 : 44,
                      paddingLeft: 42,
                      paddingRight: 14,
                      color: "#F2FFFB",
                      background: "rgba(0, 68, 55, 0.7)",
                      border: "1px solid rgba(0, 255, 225, 0.85)",
                      borderRadius: 12,
                      outline: "none",
                      boxShadow: "0 0 10px rgba(0, 255, 225, 0.18)",
                      fontFamily: "inherit",
                      fontSize: isMobile ? 14 : 15,
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {}}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "center",
                    height: isMobile ? 40 : 44,
                    paddingLeft: isMobile ? 16 : 20,
                    paddingRight: isMobile ? 16 : 20,
                  color: "#00FFE1",
                    fontWeight: 700,
                  background:
                    "linear-gradient(180deg, rgba(0, 255, 225, 0.18) 0%, rgba(0, 68, 55, 0.55) 100%)",
                  border: "1px solid rgba(0, 255, 225, 0.85)",
                  borderRadius: 12,
                    cursor: "pointer",
                  boxShadow: "0 0 12px rgba(0, 255, 225, 0.18)",
                    fontFamily: "inherit",
                    fontSize: isMobile ? 14 : 15,
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <span>Tìm ngay</span>
                </button>
              </div>
            </div>
            <label className={"font-semibold text-white text-center block " + styles.loadTime}>
              {room} | Load Time: {currentTime}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
              {visibleTableList.map((item, index) => {
                const imageUrl =
                  item.showIcon ||
                  `/assets/NH/${room}/${room}_${(index + 1)
                    .toString()
                    .padStart(2, "0")}.png`;
                return (
                  <div
                    key={item._id}
                    className={
                      isMobile
                        ? ""
                        : "transition-all duration-300 ease-in-out transform hover:scale-105"
                    }
                    style={{
                      opacity: 1,
                      animation: "fadeIn 0.3s ease-in-out",
                    }}
                  >
                    <ProgressBar
                      percentage={item.percent}
                      title={item.name}
                      imageUrl={imageUrl}
                      id={item._id}
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ height: 200 }}></div>
          </div>
        </div>
      )}
      <ModalConfirmLogout
        isShowLogout={isShowLogout}
        setIsShowLogout={() => {
          setIsShowLogout(false);
        }}
      />
    </div>
  );
};

export default Slot;
