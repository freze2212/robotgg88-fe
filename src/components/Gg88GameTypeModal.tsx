import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getAssetUrl } from "../utils/assetUrl";
import "./Gg88GameTypeModal.css";

/** Đường dẫn trong app — khớp router.js */
export const GG88_ROUTE_NOHU = "/NH";
export const GG88_ROUTE_BACCARAT = "/casino/lobby";

export type Gg88GameTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Popup khi chọn sảnh GG88: chọn NỔ HŨ hoặc BACCARAT.
 */
const Gg88GameTypeModal: React.FC<Gg88GameTypeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onKeyDown]);

  const goNoHu = useCallback(() => {
    onClose();
    navigate(GG88_ROUTE_NOHU);
  }, [navigate, onClose]);

  const goBaccarat = useCallback(() => {
    onClose();
    navigate(GG88_ROUTE_BACCARAT);
  }, [navigate, onClose]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="gg88-game-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gg88-game-type-title"
    >
      <button
        type="button"
        className="gg88-game-modal__backdrop"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        className="gg88-game-modal__panel"
        style={{
          backgroundImage: `url(${getAssetUrl("/assets/bg-modal.png")})`,
        }}
      >
        <div className="gg88-game-modal__inner">
          <h2 id="gg88-game-type-title" className="gg88-game-modal__title">
            CHỌN LOẠI GAME
          </h2>
          <div className="gg88-game-modal__actions">
            <button
              type="button"
              className="gg88-game-modal__choice"
              onClick={goNoHu}
            >
              NỔ HŨ
            </button>
            <button
              type="button"
              className="gg88-game-modal__choice"
              onClick={goBaccarat}
            >
              BACCARAT
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default Gg88GameTypeModal;
