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
    title = "Confirm",
    content = "Are you sure?",
    okText = "OK",
    cancelText = "Đóng",
    onOk,
    onCancel,
  }: ConfirmModalOptions) => {
    modal.confirm({
      title,
      icon: <ExclamationCircleOutlined />,
      content,
      okText,
      cancelText,
      onOk,
      onCancel,
    });
  };

  return {
    showConfirm,
    contextHolder,
  };
};
