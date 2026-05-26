import React, { useEffect, useState } from "react";
import { getUserProfile } from "../utilities/axios.utilities";
import "./Header.css";

interface IProps {
  setIsShowLogout: () => void;
}

function formatTokenAmount(coins: unknown): string {
  const n = Number(coins);
  if (Number.isNaN(n)) return "0";
  return n.toLocaleString("en-US");
}

const Header: React.FC<IProps> = ({ setIsShowLogout }) => {
  let userInfoString = localStorage.getItem("user_info");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setUserProfile(data);
        localStorage.setItem(
          "user_info",
          JSON.stringify({
            coins: data.coins,
            role: data.role,
            userName: data.username,
          })
        );
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const userName = userProfile?.username ?? userInfo?.userName ?? "";
  const coins = userProfile?.coins ?? userInfo?.coins;

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__greeting">
          Xin chào, {userName}
        </div>
        <div className="app-header__actions">
          <div className="app-header__token">
            {formatTokenAmount(coins)} TOKEN
          </div>
          <button
            type="button"
            className="app-header__logout"
            onClick={setIsShowLogout}
          >
            ĐĂNG XUẤT
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
