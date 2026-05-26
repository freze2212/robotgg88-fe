import React from "react";
import { getAssetUrl } from "../utils/assetUrl";
import "./FramePopupPanel.css";

const FRAME_POPUP_BG = getAssetUrl("/assets/frame-popup.png");

interface IProps {
  isShowLogout: boolean;
  setIsShowLogout: () => void;
}

const ModalConfirmLogout: React.FC<IProps> = ({
  isShowLogout,
  setIsShowLogout,
}) => {
  const Cookies = require("js-cookie");

  if (!isShowLogout) return null;

  return (
    <div
      className="frame-popup-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setIsShowLogout();
      }}
    >
      <div
        role="dialog"
        aria-labelledby="logout-modal-title"
        className="frame-popup-panel"
        style={{ backgroundImage: `url(${FRAME_POPUP_BG})` }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="frame-popup-panel__close"
          aria-label="Đóng"
          onClick={setIsShowLogout}
        >
          ×
        </button>
        <div className="frame-popup-panel__inner">
          <h2 id="logout-modal-title" className="frame-popup-panel__title">
            Đăng xuất
          </h2>
          <p className="frame-popup-panel__text">
            Bạn có chắc muốn đăng xuất không?
          </p>
          <div className="frame-popup-panel__btn-row">
            <button
              type="button"
              className="frame-popup-panel__btn-secondary"
              onClick={setIsShowLogout}
            >
              &gt; HỦY &lt;
            </button>
            <button
              type="button"
              className="frame-popup-panel__btn-primary"
              onClick={() => {
                Cookies.remove("access_token");
                localStorage.removeItem("user_info");
                setIsShowLogout();
                window.location.reload();
              }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmLogout;
