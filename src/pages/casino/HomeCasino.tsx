import { useState } from "react";
import Header from "../../components/Header";
import ModalConfirmLogout from "../../components/ModalConfirmLogout";
import { useNavigate } from "react-router-dom";

const imageCasino = [
  {
    url: "/assets/casino/ae.png",
    link: "/lobby",
    name: "ae",
  },
  {
    url: "/assets/casino/ag.png",
    link: "/lobby",
    name: "ag",
  },
  {
    url: "/assets/casino/bg.png",
    link: "/lobby",
    name: "bg",
  },
  {
    url: "/assets/casino/dg.png",
    link: "/lobby",
    name: "dg",
  },
  {
    url: "/assets/casino/evo.png",
    link: "/lobby",
    name: "evo",
  },
  {
    url: "/assets/casino/mg.png",
    link: "/lobby",
    name: "mg",
  },
  {
    url: "/assets/casino/on.png",
    link: "/lobby",
    name: "on",
  },
  {
    url: "/assets/casino/pp.png",
    link: "/lobby",
    name: "pp",
  },
  {
    url: "/assets/casino/pt.png",
    link: "/lobby",
    name: "pt",
  },
  {
    url: "/assets/casino/sa.png",
    link: "/lobby",
    name: "sa",
  },
  {
    url: "/assets/casino/sbo.png",
    link: "/lobby",
    name: "sbo",
  },
  {
    url: "/assets/casino/venus.png",
    link: "/lobby",
    name: "venus",
  },
  {
    url: "/assets/casino/via.png",
    link: "/lobby",
    name: "via",
  },
  {
    url: "/assets/casino/vivo.png",
    link: "/lobby",
    name: "vivo",
  },
  {
    url: "/assets/casino/wm.png",
    link: "/lobby",
    name: "wm",
  },
  {
    url: "/assets/casino/won.png",
    link: "/lobby",
    name: "won",
  },
];

const HomeCasino = () => {
  const [isShowLogout, setIsShowLogout] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);

  const navigate = useNavigate();

  const handleClick = (casino: any) => {
    if (casino.name === "ae") {
      navigate(`/casino${casino.link}`);
    } else {
      setShowMaintenance(true);
    }
  };

  return (
    <div className="page-with-header">
      <Header setIsShowLogout={() => setIsShowLogout(true)} />
      <div className="container-fluid lobby-bg position-relative  mx-auto  mb-5 max-w-screen-xl">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row flex-wrap my-7 gap-6 items-center sm:items-stretch">
            <div className="w-full sm:w-1/2 md:w-2/3 flex justify-center sm:justify-start">
              <img
                src="/assets/casino/all-room.png"
                alt="Slot"
                className="w-[min(100%,320px)] sm:!w-[50%] h-auto max-w-full"
              />
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 flex justify-center items-center">
              <a href="/" className="text-white no-underline w-full flex justify-center">
                <div className="box-goto-lobby">
                  Quay lại
                </div>
              </a>
            </div>
          </div>
          <div
            id="lobbySlotMain"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 all-programs py-8 mb-10 "
          >
            {imageCasino.map((e) => {
              return (
                <div
                  data-aos="flip-left"
                  data-aos-delay="100"
                  className="mb-3 aos-init aos-animate cursor-pointer transition-transform hover:scale-105 "
                  onClick={() => handleClick(e)}
                >
                  <div className="box-game">
                    <img
                      src={e.url}
                      alt="SA Casino Gaming"
                      className="img-game w-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Maintenance Modal */}
      {showMaintenance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Đang Bảo Trì</h3>
            <p className="text-gray-600 mb-6">
              Hệ thống đang được bảo trì. Vui lòng thử lại sau!
            </p>
            <button
              onClick={() => setShowMaintenance(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Đóng
            </button>
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

export default HomeCasino;
