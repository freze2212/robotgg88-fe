import React, { useEffect, useState } from "react";
import { getUserProfile } from "../utilities/axios.utilities";

interface IProps {
  setIsShowLogout: () => void;
}

const Header: React.FC<IProps> = ({ setIsShowLogout }) => {
  const [isShowMobile, setShowMobile] = useState(false);

  let userInfoString = localStorage.getItem("user_info");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setUserProfile(data);
        localStorage.setItem("user_info", JSON.stringify({
          coins: data.coins,
          role: data.role,
          userName: data.username,
        }));
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchProfile();
  }, []);


  return (
    <div className="w-full header-wrapper">
      <style>{`
        .header-wrapper {
          min-height: 100px;
        }
        .menu-lobby {
          background-image: url('/assets/bg-header.png');
          background-size: 100% 100%;
          background-position: center;
          background-repeat: no-repeat;
          min-height: 100px;
          display: flex;
          align-items: center;
        }
        .header-nav {
          display: flex;
          justify-content: space-around;
          align-items: center;
          width: 100%;
        }
        .header-logo-link {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .header-logo {
          width: 270px;
          height: 83px;
          object-fit: contain;
          object-fit: contain;
        }
        .menu-lobby .menu_wrapper {
          display: flex;
          align-items: stretch;
          gap: 12px;
        }
        .menu-lobby .menu-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 44px;
          padding: 0px 10px;
          border-radius: 9999px;
          background: rgba(15, 22, 28, 0.95);
          cursor: pointer;
          transition: filter 0.2s, box-shadow 0.2s;
          border: 1px solid #00e5ff;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
        }
        .menu-lobby .menu-item::after {
          display: none;
        }
        .menu-lobby .menu-item p {
          padding: 0;
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
        }
        .menu-lobby .menu-item p::before {
          display: none;
        }
        .menu-lobby .menu-item img {
          width: 26px;
          height: 26px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .menu-lobby .menu-item.btn-home {
          border-color: #00e5ff;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
        }
        .menu-lobby .menu-item.btn-user,
        .menu-lobby .menu-item.btn-credit2 {
          border-color: #00e5ff;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
        }
        .menu-lobby .menu-item.btn-user p,
        .menu-lobby .menu-item.btn-credit2 p {
          color: #fff;
        }
        .menu-lobby .menu-item.btn-logout {
          border-color: #00e5ff;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
          background: linear-gradient(180deg, rgba(100, 25, 25, 0.95) 0%, rgba(60, 15, 15, 0.95) 100%);
        }
        .menu-lobby .menu-item.btn-logout p {
          color: #ff4444;
        }
        .menu-lobby .menu-item:hover {
          filter: brightness(1.12);
          box-shadow: 0 0 16px rgba(0, 229, 255, 0.65);
        }
        /* Facebook — tạm ẩn */
        .facebook-link-header {
          position: fixed;
          right: 15px;
          bottom: calc(30% + 100px);
          z-index: 10;
          display: none !important;
        }
        .facebook-icon-header {
          width: 130px;
          height: 130px;
          cursor: pointer;
          transition: transform 0.3s ease;
          display: block;
        }
        .facebook-link-header:hover .facebook-icon-header {
          transform: scale(1.1);
        }
        /* Telegram — tạm ẩn */
        .telegram-link-header {
          position: fixed;
          right: 30px;
          bottom: 30%;
          z-index: 10;
          display: none !important;
        }
        .telegram-icon-header {
          width: 100px;
          height: 100px;
          cursor: pointer;
          transition: transform 0.3s ease;
          display: block;
        }
        .telegram-link-header:hover .telegram-icon-header {
          transform: scale(1.1);
        }
        @media (max-width: 768px) {
          .header-wrapper {
            min-height: 64px;
          }
          .menu-lobby {
            background-image: url('/assets/bg-header.png');
            min-height: 64px;
            padding-left: max(12px, env(safe-area-inset-left, 0px));
            padding-right: max(12px, env(safe-area-inset-right, 0px));
          }
          .menu-lobby .navbar {
            padding-left: 0;
            padding-right: 0;
          }
          .mobile-logo-header {
            display: block !important;
          }
          .header-nav {
            justify-content: space-around;
          }
          .header-logo-link {
            display: none;
          }
          .mobile-logo-header .header-logo {
            width: 177px;
            height: 49px;
          }
          /* Mobile responsive - adjusted higher position */
          .facebook-link-header {
            right: 0px;
            top: 20%;
          }
          .facebook-icon-header {
            width: 80px;
            height: 80px;
          }
          .telegram-link-header {
            right: 10px;
            top: calc(21% + 70px);
          }
          .telegram-icon-header {
            width: 60px;
            height: 60px;
          }
        }
        .mobile-logo-header {
          display: none;
        }
      `}</style>
      {/* Facebook Icon - Fixed position like login page */}
      <a 
        href="https://www.facebook.com/profile.php?id=100089597561391" 
        target="_blank" 
        rel="noopener noreferrer"
        className="facebook-link-header"
      >
        <img 
          src="/assets/fb.png" 
          alt="Facebook"
          className="facebook-icon-header"
        />
      </a>

      {/* Telegram Icon - Fixed position like login page */}
      <a 
        href="https://t.me/TKTONGJEN" 
        target="_blank" 
        rel="noopener noreferrer"
        className="telegram-link-header"
      >
        <img 
          src="/assets/tele.png" 
          alt="Telegram"
          className="telegram-icon-header"
        />
      </a>

      <header className="menu-lobby">
        <nav className="navbar navbar-expand-lg navbar-dark header-nav">
          <a href="/" className="header-logo-link">
            <img 
              src="/assets/logo-g8.png" 
              alt="TOOL G8" 
              className="header-logo"
            />
          </a>
          <a href="/" className="mobile-logo-header">
            <img 
              src="/assets/logo-g8.png" 
              alt="TOOL G8" 
              className="header-logo"
            />
          </a>
          <div className="menu">
            <div
              className={
                isShowMobile
                  ? "menu_wrapper menu_wrapper_active"
                  : "menu_wrapper"
              }
            >
              {/* menu_wrapper_active */}
              <a href="/" className="menu-item btn-home">
                <p>Trang chủ</p>
              </a>
              <div className="menu-item btn-user flex items-center">
                <img
                  src="/assets/user-icon.png"
                  alt="pdjhjf"
                  className="w-[30px] h-[30px]"
                />
                <p>{userInfo?.userName}</p>
              </div>
              <div className="menu-item btn-credit2 btn-redeem flex items-center">
                <img
                  src="/assets/coins.png"
                  alt="pdjhjf"
                  className="w-[30px] h-[30px]"
                />
                <p>{userInfo?.coins}</p>
              </div>

              <div
                className="menu-item btn-logout flex items-center"
                onClick={setIsShowLogout}
              >
                <img
                  src="/assets/logout.png"
                  alt="pdjhjf"
                  className="w-[30px] h-[30px]"
                />
                <p>Đăng xuất</p>
              </div>
            </div>
            {isShowMobile ? (
              <div
                className="menu-icon change"
                onClick={() => setShowMobile(false)}
              >
                <div className="bar1" />
                <div className="bar2" />
                <div className="bar3" />
              </div>
            ) : (
              <div className="menu-icon" onClick={() => setShowMobile(true)}>
                <div className="bar1" />
                <div className="bar2" />
                <div className="bar3" />
              </div>
            )}
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Header;
