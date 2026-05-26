import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getAssetUrl } from "../utils/assetUrl";
import "./Gg88GameTypeModal.css";

/** Đường dẫn trong app — khớp router.js */
export const GG88_ROUTE_SLOT = "/NH";
export const GG88_ROUTE_BAN_CA = "/casino/lobby";

export type Gg88GameTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Popup chọn loại game GG88 — nền frame-popup, SLOT GAME / BẮN CÁ.
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

  const goSlotGame = useCallback(() => {
    onClose();
    navigate(GG88_ROUTE_SLOT);
  }, [navigate, onClose]);

  const goBanCa = useCallback(() => {
    onClose();
    navigate(GG88_ROUTE_BAN_CA);
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
          backgroundImage: `url(${getAssetUrl("/assets/frame-popup.png")})`,
        }}
      >
        <div className="gg88-game-modal__inner">
          <h2 id="gg88-game-type-title" className="gg88-game-modal__title">
            /CHỌN LOẠI GAME/
          </h2>
          <div className="gg88-game-modal__actions">
            <button
              type="button"
              className="gg88-game-modal__choice"
              onClick={goSlotGame}
            >
              SLOT GAME
            </button>
            <button
              type="button"
              className="gg88-game-modal__choice"
              onClick={goBanCa}
            >
              BẮN CÁ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default Gg88GameTypeModal;
