import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { getAssetUrl } from "../utils/assetUrl";
import "./HallNoticeModal.css";

export type HallNoticeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Tên sảnh bị cảnh báo (vd: 78win, 8Kbet, XX88…) */
  hallBrand: string;
};

/**
 * Popup THÔNG BÁO khi chọn sảnh không phải GG88 — khuyên chọn GG88.
 */
const HallNoticeModal: React.FC<HallNoticeModalProps> = ({
  isOpen,
  onClose,
  hallBrand,
}) => {
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

  if (!isOpen) return null;

  /**
   * KHÔNG dùng thẻ <header> trong modal: main.login.css có `header { position: fixed; top:0 }`
   * global → kéo cả hàng tiêu đề lên đỉnh màn hình, trông như nội dung nằm ở header trang.
   */
  const modal = (
    <div
      className="hall-notice-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hall-notice-title"
    >
      <button
        type="button"
        className="hall-notice-modal__backdrop"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        className="hall-notice-modal__panel"
        style={{
          backgroundImage: `url(${getAssetUrl("/assets/frame-popup.png")})`,
        }}
      >
        <div className="hall-notice-modal__inner">
          <div
            className="hall-notice-modal__head"
            role="group"
            aria-labelledby="hall-notice-title"
          >
            <img
              className="hall-notice-modal__bell"
              src={getAssetUrl("/assets/alert.png")}
              alt=""
              aria-hidden
            />
            <h2 id="hall-notice-title" className="hall-notice-modal__title">
              THÔNG BÁO
            </h2>
            <img
              className="hall-notice-modal__bell"
              src={getAssetUrl("/assets/alert.png")}
              alt=""
              aria-hidden
            />
          </div>
          <p className="hall-notice-modal__body">
            Sảnh <strong>{hallBrand}</strong> có tỷ lệ khá thấp. Vui lòng chọn
            sảnh <strong>GG88</strong> để có trải nghiệm tốt nhất!
          </p>
          <button
            type="button"
            className="hall-notice-modal__btn"
            onClick={onClose}
          >
            ĐÃ HIỂU
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default HallNoticeModal;
