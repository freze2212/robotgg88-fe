import React from "react";
import "./Modal.css";

type Props = {
  show: boolean;
  onClose: () => void;
};

const UserModal = ({ show, onClose }: Props) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop show">
      <div className="modal-content-box">
        <div className="modal-header">
          <h5>Thông Tin Người Dùng</h5>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>
            <strong>Tài khoản:</strong> jun999
          </p>
          <p>
            <strong>Xu:</strong> 114718
          </p>
          <p>
            <strong>Thời gian đăng nhập:</strong> 13/04/2025 22:45
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
