import React, { useEffect, useRef, useState } from "react";
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
  const latestCoinsRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        const coins = latestCoinsRef.current ?? data.coins;
        const profile = { ...data, coins };
        setUserProfile(profile);
        localStorage.setItem(
          "user_info",
          JSON.stringify({
            coins,
            role: profile.role,
            userName: profile.username,
          })
        );
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchProfile();

    const handleCoinsUpdated = (event: Event) => {
      const coins = Number(
        (event as CustomEvent<{ coins?: number }>).detail?.coins
      );
      if (!Number.isFinite(coins)) return;

      latestCoinsRef.current = coins;
      setUserProfile((current: any) => ({
        ...(current ?? {}),
        coins,
      }));
    };

    window.addEventListener("user-coins-updated", handleCoinsUpdated);
    return () =>
      window.removeEventListener("user-coins-updated", handleCoinsUpdated);
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
