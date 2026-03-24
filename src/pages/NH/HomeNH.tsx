import { useState } from "react";
import Header from "../../components/Header";
import ModalConfirmLogout from "../../components/ModalConfirmLogout";
import { useNavigate } from "react-router-dom";

const imageCasino = [
  {
    url: "assets/NH/menuGame/PG.png",
    link: "/PG",
    name: "PG ĐIỆN TỬ",
  },
  {
    url: "assets/NH/menuGame/BNG.png",
    link: "/BNG",
    name: "BNG ĐIỆN TỬ",
  },
  {
    url: "assets/NH/menuGame/CQ9.png",
    link: "/CQ9",
    name: "CQ9 ĐIỆN TỬ",
  },
  {
    url: "assets/NH/menuGame/EVOPLAY.png",
    link: "/EVOPLAY",
    name: "EVOPLAY ĐIỆN TỬ",
  },
  {
    url: "assets/NH/menuGame/FASHPIN.png",
    link: "/FASHPIN",
    name: "FASHPIN ĐIỆN TỬ",
  },
  {
    url: "assets/NH/menuGame/JDB.png",
    link: "/JDB",
    name: "JDB ĐIỆN TỬ",
  },
  {
    url: "assets/NH/menuGame/JILI.png",
    link: "/JILI",
    name: "JILI ĐIỆN TỬ",
  },
  {
    url: "assets/NH/menuGame/PP.png",
    link: "/PP",
    name: "PP ĐIỆN TỬ",
  },
  {
    url: "assets/NH/menuGame/SPADEGAMING.png",
    link: "/SPADEGAMING",
    name: "SPADEGAMING ĐIỆN TỬ",
  },
  {
    url: "assets/NH/menuGame/SPRIBE.png",
    link: "/SPRIBE",
    name: "SPRIBE ĐIỆN TỬ",
  },
  {
    url: "assets/NH/menuGame/VA.png",
    link: "/VA",
    name: "VA ĐIỆN TỬ",
  },
];


const HomeNH = () => {
  const [isShowLogout, setIsShowLogout] = useState(false);
  const navigate = useNavigate();

  const handleClick = (e: string) => {
    navigate(`/NH/slot${e}`);
  };

  return (
    <div>
      <Header setIsShowLogout={() => setIsShowLogout(true)} />
      <div className="container-fluid lobby-bg position-relative  mx-auto  mb-5 max-w-screen-xl">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row flex-wrap my-7 gap-6 items-center sm:items-stretch">
            <div className="w-full sm:w-1/2 md:w-2/3 flex justify-center sm:justify-start">
              <img
                src="/assets/NH/SLOT_ROOM_ai.png"
                alt="Slot"
                className="w-[min(100%,280px)] sm:!w-[50%] h-auto max-w-full"
              />
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 flex justify-center items-center">
              <a href="/" className="text-white no-underline w-full flex justify-center sm:justify-center">
                <div className="box-goto-lobby">
                  Quay lại
                </div>
              </a>
            </div>
          </div>
          <div
            id=""
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 all-programs py-8 mb-10"
          >
            {imageCasino.map((e) => {
              return (
                <div
                  data-aos="flip-left"
                  data-aos-delay="100"
                  className="mb-1 aos-init aos-animate cursor-pointer transition-transform transform duration-300 ease-in-out hover:scale-110"
                  onClick={() => handleClick(e.link)}
                >
                  <div className="box-game w-[80%] mx-auto group">
                    <img
                      src={e.url}
                      alt="SA Casino Gaming"
                      className="w-full transition duration-300 ease-in-out group-hover:drop-shadow-[0_0_10px_#1e943b]"
                    />
                    <label className="mt-2 font-semibold text-white text-center block transition duration-300 ease-in-out group-hover:drop-shadow-[0_0_6px_#1e943b]">
                      {e.name}
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ModalConfirmLogout
        isShowLogout={isShowLogout}
        setIsShowLogout={() => {
          setIsShowLogout(false);
        }}
      />
    </div>
  );
};

export default HomeNH;
