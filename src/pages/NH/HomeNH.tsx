import { useMemo, useState } from "react";
import Header from "../../components/Header";
import ModalConfirmLogout from "../../components/ModalConfirmLogout";
import { getAssetUrl } from "../../utils/assetUrl";
import { useNavigate } from "react-router-dom";
import "./HomeNH.css";

const imageCasino = [
  {
    url: "/assets/NH/menuGame/PG.png",
    link: "/PG",
    name: "PG ĐIỆN TỬ",
  },
  {
    url: "/assets/NH/menuGame/BNG.png",
    link: "/BNG",
    name: "BNG ĐIỆN TỬ",
  },
  {
    url: "/assets/NH/menuGame/CQ9.png",
    link: "/CQ9",
    name: "CQ9 ĐIỆN TỬ",
  },
  {
    url: "/assets/NH/menuGame/EVOPLAY.png",
    link: "/EVOPLAY",
    name: "EVOPLAY ĐIỆN TỬ",
  },
  {
    url: "/assets/NH/menuGame/FASTPIN.png",
    link: "/FASHPIN",
    name: "FASTSPIN ĐIỆN TỬ",
  },
  {
    url: "/assets/NH/menuGame/JDB.png",
    link: "/JDB",
    name: "JDB ĐIỆN TỬ",
  },
  {
    url: "/assets/NH/menuGame/JILI.png",
    link: "/JILI",
    name: "JILI ĐIỆN TỬ",
  },
  {
    url: "/assets/NH/menuGame/PP.png",
    link: "/PP",
    name: "PRAGMATICPLAY ĐIỆN TỬ",
  },
  {
    url: "/assets/NH/menuGame/SPADEGAMING.png",
    link: "/SPADEGAMING",
    name: "SPADEGAMING ĐIỆN TỬ",
  },
  {
    url: "/assets/NH/menuGame/SPRIBE.png",
    link: "/SPRIBE",
    name: "SPRIBE ĐIỆN TỬ",
  },
  {
    url: "/assets/NH/menuGame/VA.png",
    link: "/VA",
    name: "VA ĐIỆN TỬ",
  },
];

const HomeNH = () => {
  const [isShowLogout, setIsShowLogout] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return imageCasino;
    return imageCasino.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleClick = (link: string) => {
    navigate(`/NH/slot${link}`);
  };

  return (
    <div className="page-with-header">
      <Header setIsShowLogout={() => setIsShowLogout(true)} />
      <div className="container-fluid lobby-bg position-relative mx-auto mb-5 slot-lobby-page">
        <div className="slot-lobby-page__inner">
          <section className="slot-lobby-hero" aria-label="Chọn sảnh game">
            <div className="slot-lobby-hero__inner">
              <button
                type="button"
                className="slot-lobby-back"
                onClick={() => navigate("/")}
                aria-label="Về trang chủ"
              >
                <span className="slot-lobby-back__chevrons" aria-hidden>
                  &laquo;&laquo;
                </span>
                BACK
              </button>

              <h1 className="slot-lobby-title">&gt;_SẢNH GAME CỦA GG88_&lt;</h1>

              <form
                className="slot-lobby-search"
                onSubmit={(e) => e.preventDefault()}
                role="search"
              >
                <label className="slot-lobby-search__field">
                  <span className="slot-lobby-search__icon" aria-hidden>
                    &#128269;
                  </span>
                  <input
                    type="search"
                    className="slot-lobby-search__input"
                    placeholder="Tìm kiếm game..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Tìm kiếm game"
                  />
                </label>
                <button type="submit" className="slot-lobby-search__submit">
                  <span aria-hidden>&#128269;</span>
                  Tìm ngay
                </button>
              </form>
            </div>
          </section>

          <div className="all-programs slot-lobby-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 pt-3 py-8 mb-10">
            {filteredGames.length === 0 ? (
              <p className="slot-lobby-empty">Không tìm thấy sảnh phù hợp.</p>
            ) : (
              filteredGames.map((item) => (
                <div
                  key={item.link}
                  data-aos="flip-left"
                  data-aos-delay="100"
                  className="mb-1 aos-init aos-animate cursor-pointer transition-transform transform duration-300 ease-in-out hover:scale-110"
                  onClick={() => handleClick(item.link)}
                >
                  <div className="box-game group">
                    <img
                      src={getAssetUrl(item.url)}
                      alt={item.name}
                      className="w-full transition duration-300 ease-in-out group-hover:drop-shadow-[0_0_10px_#ffd700]"
                    />
                    <label className="mt-2 font-semibold text-white text-center block transition duration-300 ease-in-out group-hover:drop-shadow-[0_0_6px_#ffd700]">
                      {item.name}
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <ModalConfirmLogout
        isShowLogout={isShowLogout}
        setIsShowLogout={() => setIsShowLogout(false)}
      />
    </div>
  );
};

export default HomeNH;
