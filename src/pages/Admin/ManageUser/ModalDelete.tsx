import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { ReactNode } from "react";

type ConfirmModalOptions = {
  title?: string;
  content?: ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
};

export const useConfirmModal = () => {
  const [modal, contextHolder] = Modal.useModal();

  const showConfirm = ({
    title = "Xác nhận",
    content = "Bạn có chắc chắn muốn thực hiện hành động này?",
    okText = "Xác nhận",
    cancelText = "Đóng",
    onOk,
    onCancel,
  }: ConfirmModalOptions) => {
    modal.confirm({
      className: "admin-modal admin-confirm-modal",
      rootClassName: "admin-modal-root",
      title: <span className="admin-confirm-title">{title}</span>,
      icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
      content: <div className="admin-confirm-content">{content}</div>,
      okText,
      cancelText,
      okButtonProps: {
        className: "admin-danger-button ant-btn",
      },
      cancelButtonProps: {
        className: "admin-secondary-button ant-btn",
      },
      onOk,
      onCancel,
    });
  };

  return {
    showConfirm,
    contextHolder,
  };
};
