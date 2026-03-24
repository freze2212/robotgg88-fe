import React from "react";
import { getAssetUrl } from "../utils/assetUrl";
import "./LobbyConfirmTableModal.css";

export type LobbyConfirmTableModalProps = {
  open: boolean;
  tableName: string;
  /** Phí vào cửa hiển thị (vd: "5 Token") */
  entryFeeLabel?: string;
  /** Phí duy trì (vd: "5 Token / 30s") */
  maintenanceFeeLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
};

const DEFAULT_ENTRY =
  process.env.REACT_APP_LOBBY_ENTRY_FEE_LABEL ?? "5 Token";
const DEFAULT_MAINT =
  process.env.REACT_APP_LOBBY_MAINTENANCE_FEE_LABEL ?? "5 Token / 30s";

/** Hiển thị gọn kiểu mã bàn: C16, C04… */
function formatConfirmTableCode(raw: string): string {
  const s = String(raw).trim();
  if (!s) return "";
  const m = s.match(/(C\d+)/i);
  if (m) return m[1].toUpperCase();
  return s.toUpperCase();
}

/**
 * Popup xác nhận vào bàn — nền bg-result + khung hacker.
 */
const LobbyConfirmTableModal: React.FC<LobbyConfirmTableModalProps> = ({
  open,
  tableName,
  entryFeeLabel = DEFAULT_ENTRY,
  maintenanceFeeLabel = DEFAULT_MAINT,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div
      className="lobby-confirm-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="lobby-confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lobby-confirm-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="lobby-confirm__close"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>

        <div className="lobby-confirm__panel">
          {/* Nền ảnh tách lớp — giữ đúng tỉ lệ 445:312 như thẻ lobby, không kéo méo */}
          <div
            className="lobby-confirm__bg"
            style={{
              backgroundImage: `url(${getAssetUrl("/assets/bg-result.png")})`,
            }}
            aria-hidden
          />
          <div className="lobby-confirm__grid" aria-hidden />

          <header className="lobby-confirm__header">
            <span className="lobby-confirm__warn" aria-hidden>
              ⚠
            </span>
            <h2 id="lobby-confirm-title" className="lobby-confirm__title">
              XÁC NHẬN HACK
            </h2>
            <span className="lobby-confirm__warn" aria-hidden>
              ⚠
            </span>
          </header>

          <p className="lobby-confirm__question">
            Bạn có chắc muốn vào bàn này?
          </p>
          {tableName ? (
            <p
              className="lobby-confirm__table-name"
              title={tableName}
            >
              {formatConfirmTableCode(tableName)}
            </p>
          ) : null}

          <div className="lobby-confirm__box">
            <div className="lobby-confirm__row">
              <span className="lobby-confirm__label">Phí vào cửa:</span>
              <span className="lobby-confirm__value">{entryFeeLabel}</span>
            </div>
            <div className="lobby-confirm__row">
              <span className="lobby-confirm__label">Phí duy trì:</span>
              <span className="lobby-confirm__value">{maintenanceFeeLabel}</span>
            </div>
          </div>

          <div className="lobby-confirm__actions">
            <button
              type="button"
              className="lobby-confirm__btn lobby-confirm__btn--primary"
              onClick={onConfirm}
            >
              Hack ngay
            </button>
            <button
              type="button"
              className="lobby-confirm__btn lobby-confirm__btn--danger"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyConfirmTableModal;
