import React from "react";
import { Modal, Form, InputNumber, Button, Radio } from "antd";
import { DollarCircleOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import axios from "axios";
import Swal from "sweetalert2";

interface IProps {
  isShowCoin: boolean;
  onCanCoin: () => void;
  id: string;
  onRefesh: () => void;
}

const ModalAppCoin: React.FC<IProps> = ({
  isShowCoin,
  onCanCoin,
  id,
  onRefesh,
}) => {
  const Cookie = require("js-cookie");
  const token = Cookie.get("access_token");
  const [form] = Form.useForm();

  const handleAppCoin = async (value: any) => {
    const coinVal = Number(value.coin);
    if (!coinVal || coinVal <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Số xu không hợp lệ",
        text: "Vui lòng nhập số xu lớn hơn 0.",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
        },
      });
      return;
    }

    try {
      const endpoint =
        value.type === "removeCoin"
          ? `${process.env.REACT_APP_URL_API}/users/${id}/subtract-coins`
          : `${process.env.REACT_APP_URL_API}/users/${id}/add-coins`;

      const response = await axios.post(
        endpoint,
        { amount: coinVal },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        onCanCoin();
        form.resetFields();
        Swal.fire({
          icon: "success",
          title:
            value.type === "removeCoin"
              ? "Trừ xu thành công"
              : "Cộng xu thành công",
          text: `Đã ${value.type === "removeCoin" ? "trừ" : "cộng"} ${coinVal.toLocaleString("vi-VN")} xu cho tài khoản.`,
          timer: 1500,
          timerProgressBar: true,
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            icon: "custom-icon",
          },
        });
        onRefesh();
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi điều chỉnh xu",
        text: error?.response?.data?.message || "Không thể thực hiện thao tác.",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
        },
      });
    }
  };

  return (
    <Modal
      className="admin-modal"
      title={
        <span className="admin-modal-title-text">
          🪙 Điều Chỉnh Số Dư Xu
        </span>
      }
      open={isShowCoin}
      onCancel={() => {
        form.resetFields();
        onCanCoin();
      }}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        onFinish={handleAppCoin}
        layout="vertical"
        initialValues={{ coin: 10000, type: "addCoin" }}
        className="admin-form"
      >
        <Form.Item
          name="type"
          label={<span className="admin-form-label">Thao tác số dư</span>}
        >
          <Radio.Group className="admin-radio-group">
            <Radio.Button value="addCoin" className="admin-radio-btn-add">
              <PlusOutlined style={{ marginRight: 4 }} /> Cộng thêm xu
            </Radio.Button>
            <Radio.Button value="removeCoin" className="admin-radio-btn-remove">
              <MinusOutlined style={{ marginRight: 4 }} /> Trừ bớt xu
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="coin"
          label={<span className="admin-form-label">Số lượng xu</span>}
          rules={[{ required: true, message: "Vui lòng nhập số xu!" }]}
        >
          <InputNumber
            className="admin-input-number"
            style={{ width: "100%" }}
            prefix={<DollarCircleOutlined style={{ color: "#ffd666", marginRight: 6 }} />}
            min={1}
            max={10000000000}
            step={1000}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) =>
              value ? value.replace(/\$\s?|(,*)/g, "") as any : ""
            }
          />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-yellow-500/20">
          <Button
            className="admin-secondary-button"
            onClick={() => {
              form.resetFields();
              onCanCoin();
            }}
          >
            Đóng
          </Button>
          <Button className="admin-gold-button" htmlType="submit">
            Xác nhận
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ModalAppCoin;
