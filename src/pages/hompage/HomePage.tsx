import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Header from "../../components/Header";
import Gg88GameTypeModal from "../../components/Gg88GameTypeModal";
import HallNoticeModal from "../../components/HallNoticeModal";
import HomeMarquee from "../../components/HomeMarquee";
import ModalConfirmLogout from "../../components/ModalConfirmLogout";
import { getAssetUrl } from "../../utils/assetUrl";
import { LOBBY_CAROUSEL, cn, type TrackPhase } from "./homeLobby.constants";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export type HallItem = {
  id: string;
  brand: string;
  name: string;
  logo: string;
  percent: number;
  href: string;
};

const HALLS: HallItem[] = [
  { id: "78win", brand: "78win", name: "GG88", logo: "/assets/logo-78win.png", percent: 0, href: "/casino" },
  { id: "8kbet", brand: "8Kbet", name: "GG88", logo: "/assets/logo-8kbet.png", percent: 0, href: "/casino" },
  { id: "gg88", brand: "GG88", name: "GG88", logo: "/assets/logo-gg88.png", percent: 0, href: "/" },
  { id: "xx88", brand: "XX88", name: "GG88", logo: "/assets/logo-xx88.png", percent: 0, href: "/NH" },
  { id: "c168", brand: "C168", name: "GG88", logo: "/assets/logo-c168.png", percent: 0, href: "/NH" },
];

function randomIntInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildRandomHallPercents(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const h of HALLS) {
    map[h.id] =
      h.id === "gg88" ? randomIntInclusive(91, 99) : randomIntInclusive(30, 60);
  }
  return map;
}

const HomePage = () => {
  const [isShowLogout, setIsShowLogout] = useState(false);
  const [hallNoticeBrand, setHallNoticeBrand] = useState<string | null>(null);
  const [showGg88GameModal, setShowGg88GameModal] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [trackPhase, setTrackPhase] = useState<TrackPhase>("idle");
  const [carouselBusy, setCarouselBusy] = useState(false);
  const navBusyRef = useRef(false);
  const navigate = useNavigate();
  const pendingNavRef = useRef<{
    dir: "next" | "prev";
    apply: () => void;
  } | null>(null);
  const phaseRef = useRef<TrackPhase>("idle");
  const touchStartXRef = useRef(0);

  useEffect(() => {
    phaseRef.current = trackPhase;
  }, [trackPhase]);

  const n = HALLS.length;
  const hallPercents = useMemo(() => buildRandomHallPercents(), []);

  const visibleHalls = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const h = HALLS[(startIndex + i) % n];
      return { ...h, percent: hallPercents[h.id] };
    });
  }, [startIndex, n, hallPercents]);

  const hallsWithPercent = useMemo(
    () => HALLS.map((h) => ({ ...h, percent: hallPercents[h.id] })),
    [hallPercents]
  );

  /** Mobile: GG88 lên đầu danh sách */
  const hallsWithPercentMobile = useMemo(() => {
    const list = HALLS.map((h) => ({ ...h, percent: hallPercents[h.id] }));
    const gg = list.find((h) => h.id === "gg88");
    if (!gg) return list;
    return [gg, ...list.filter((h) => h.id !== "gg88")];
  }, [hallPercents]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTrackTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (
        e.propertyName !== "transform" &&
        e.propertyName !== "-webkit-transform"
      )
        return;
      if (e.target !== e.currentTarget) return;
      const pending = pendingNavRef.current;
      if (!pending) return;
      const p = phaseRef.current;
      if (p !== "exit-next" && p !== "exit-prev") return;

      pendingNavRef.current = null;
      pending.apply();
      setTrackPhase(pending.dir === "next" ? "enter-next" : "enter-prev");
    },
    []
  );

  const handleTrackAnimationEnd = useCallback(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (!e.animationName.includes("home-lobby-enter")) return;
      const p = phaseRef.current;
      if (p !== "enter-next" && p !== "enter-prev") return;
      setTrackPhase("idle");
      navBusyRef.current = false;
      setCarouselBusy(false);
    },
    []
  );

  const runCarouselNav = useCallback(
    (dir: "next" | "prev", apply: () => void) => {
      if (navBusyRef.current) return;
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        apply();
        return;
      }

      navBusyRef.current = true;
      setCarouselBusy(true);
      pendingNavRef.current = { dir, apply };
      setTrackPhase(dir === "next" ? "exit-next" : "exit-prev");
    },
    []
  );

  useEffect(() => {
    const p = trackPhase;
    if (p !== "exit-next" && p !== "exit-prev") return;
    if (!pendingNavRef.current) return;
    const id = window.setTimeout(() => {
      const pending = pendingNavRef.current;
      if (!pending) return;
      if (phaseRef.current !== "exit-next" && phaseRef.current !== "exit-prev")
        return;
      pendingNavRef.current = null;
      pending.apply();
      setTrackPhase(pending.dir === "next" ? "enter-next" : "enter-prev");
    }, LOBBY_CAROUSEL.FALLBACK_EXIT_MS);
    return () => window.clearTimeout(id);
  }, [trackPhase]);

  useEffect(() => {
    const p = trackPhase;
    if (p !== "enter-next" && p !== "enter-prev") return;
    const id = window.setTimeout(() => {
      if (phaseRef.current !== "enter-next" && phaseRef.current !== "enter-prev")
        return;
      setTrackPhase("idle");
      navBusyRef.current = false;
      setCarouselBusy(false);
    }, LOBBY_CAROUSEL.FALLBACK_ENTER_MS);
    return () => window.clearTimeout(id);
  }, [trackPhase]);

  const goBack = useCallback(() => {
    runCarouselNav("prev", () => {
      setStartIndex((s) => (s - 1 + n) % n);
    });
  }, [n, runCarouselNav]);

  const goNext = useCallback(() => {
    runCarouselNav("next", () => {
      setStartIndex((s) => (s + 1) % n);
    });
  }, [n, runCarouselNav]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (carouselBusy || navBusyRef.current) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable=true]")) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [carouselBusy, goBack, goNext]);

  const goToIndex = useCallback(
    (i: number) => {
      if (i === startIndex) return;
      const forward = (i - startIndex + n) % n;
      const backward = (startIndex - i + n) % n;
      const dir: "next" | "prev" = forward <= backward ? "next" : "prev";
      runCarouselNav(dir, () => setStartIndex(i));
    },
    [n, startIndex, runCarouselNav]
  );

  const handleFrameClick = (hall: HallItem) => {
    if (hall.id !== "gg88") {
      if (hall.href === "/NH") {
        navigate("/NH");
        return;
      }
      setHallNoticeBrand(hall.brand);
      return;
    }
    setShowGg88GameModal(true);
  };

  const onSwipeTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  }, []);

  const onSwipeTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (carouselBusy || navBusyRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartXRef.current;
      const threshold = 56;
      if (Math.abs(dx) < threshold) return;
      if (dx < 0) goNext();
      else goBack();
    },
    [carouselBusy, goBack, goNext]
  );

  return (
    <div className="home-page">
      <Header setIsShowLogout={() => setIsShowLogout(true)} />

      <HomeMarquee />

      <h1 className="home-section-title">CHỌN SẢNH GAME</h1>

      {/* PC / tablet ≥768px: carousel như cũ */}
      <section
        className="home-lobby home-lobby--desktop-only"
        aria-label="Danh sách sảnh game"
        aria-roledescription="carousel"
        aria-busy={carouselBusy}
      >
        <div
          className={cn(
            "home-lobby__frames",
            trackPhase !== "idle" && "home-lobby__frames--moving"
          )}
          onTouchStart={onSwipeTouchStart}
          onTouchEnd={onSwipeTouchEnd}
        >
          <div
            className={cn(
              "home-lobby__track",
              trackPhase !== "idle" && `home-lobby__track--${trackPhase}`
            )}
            onTransitionEnd={handleTrackTransitionEnd}
            onAnimationEnd={handleTrackAnimationEnd}
          >
            {visibleHalls.map((hall, slot) => {
              const isCenter = slot === 2;
              return (
                <button
                  key={`${hall.id}-${startIndex}-${slot}`}
                  type="button"
                  className={`home-frame ${isCenter ? "home-frame--center" : ""}`}
                  style={{
                    backgroundImage: `url(${getAssetUrl("/assets/bg-modal.png")})`,
                  }}
                  onClick={() => handleFrameClick(hall)}
                >
                  <div className="home-frame__inner">
                    <div className="home-frame__logo-wrap">
                      <img
                        className="home-frame__logo"
                        src={getAssetUrl(hall.logo)}
                        alt={hall.brand}
                        draggable={false}
                      />
                    </div>
                  </div>
                  <span className="home-frame__label">{hall.brand}</span>
                  <div className="home-frame__percent-wrap">
                    <span
                      className="home-frame__percent"
                      style={{
                        backgroundImage: `url(${getAssetUrl("/assets/bg-percent.png")})`,
                      }}
                    >
                      {hall.percent}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="home-lobby__controls">
          <button
            type="button"
            className="home-lobby__btn home-lobby__btn--nav"
            onClick={goBack}
            aria-label="Sảnh trước"
            disabled={carouselBusy}
          >
            <span className="home-lobby__btn-icon" aria-hidden>
              ‹
            </span>
            <span>BACK</span>
          </button>
          <div
            className="home-lobby__dots"
            role="tablist"
            aria-label="Chọn sảnh"
          >
            {HALLS.map((hall, i) => (
              <button
                key={hall.id}
                type="button"
                role="tab"
                aria-selected={startIndex === i}
                aria-label={`${hall.brand}, sảnh ${i + 1} / ${HALLS.length}`}
                className={cn(
                  "home-lobby__dot",
                  startIndex === i && "home-lobby__dot--active"
                )}
                onClick={() => goToIndex(i)}
                disabled={carouselBusy}
              />
            ))}
          </div>
          <button
            type="button"
            className="home-lobby__btn home-lobby__btn--nav"
            onClick={goNext}
            aria-label="Sảnh sau"
            disabled={carouselBusy}
          >
            <span>NEXT</span>
            <span className="home-lobby__btn-icon" aria-hidden>
              ›
            </span>
          </button>
        </div>
      </section>

      {/* Chỉ mobile (max-width: 767px): lưới 2 cột, 5 thẻ đều nhau */}
      <section className="home-lobby home-lobby--mobile-only" aria-label="Danh sách sảnh game">
        <div className="home-lobby__grid">
          {hallsWithPercentMobile.map((hall) => (
            <button
              key={hall.id}
              type="button"
              className="home-frame home-frame--grid"
              style={{
                backgroundImage: `url(${getAssetUrl("/assets/bg-modal.png")})`,
              }}
              onClick={() => handleFrameClick(hall)}
            >
              <div className="home-frame__inner">
                <div className="home-frame__logo-wrap">
                  <img
                    className="home-frame__logo"
                    src={getAssetUrl(hall.logo)}
                    alt={hall.brand}
                    draggable={false}
                  />
                </div>
              </div>
              <span className="home-frame__label">{hall.brand}</span>
              <div className="home-frame__percent-wrap">
                <span
                  className="home-frame__percent"
                  style={{
                    backgroundImage: `url(${getAssetUrl("/assets/bg-percent.png")})`,
                  }}
                >
                  {hall.percent}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <HallNoticeModal
        isOpen={hallNoticeBrand !== null}
        onClose={() => setHallNoticeBrand(null)}
        hallBrand={hallNoticeBrand ?? ""}
      />

      <Gg88GameTypeModal
        isOpen={showGg88GameModal}
        onClose={() => setShowGg88GameModal(false)}
      />

      <ModalConfirmLogout
        isShowLogout={isShowLogout}
        setIsShowLogout={() => {
          setIsShowLogout(false);
        }}
      />
    </div>
  );
};

export default HomePage;
