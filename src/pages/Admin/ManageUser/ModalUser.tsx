import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Radio } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Swal from "sweetalert2";
import { DataType } from "./ListUser";

interface IProps {
  isShowCreate: boolean;
  onCancel: () => void;
  onRefesh: () => void;
  isShowEdit: boolean;
  onCanEdit: () => void;
  data?: DataType;
}

interface IForm {
  username: string;
  phone: string;
  password: string;
  re_password: string;
  role: string;
}

const ModalUser: React.FC<IProps> = ({
  isShowCreate,
  onCancel,
  onRefesh,
  onCanEdit,
  isShowEdit,
  data,
}) => {
  const Cookie = require("js-cookie");
  const token = Cookie.get("access_token");
  const [form] = Form.useForm();

  useEffect(() => {
    if (isShowEdit && data) {
      form.setFieldsValue({
        username: data?.username,
        phone: data?.phone,
        password: "",
        re_password: "",
        role: data?.role === "ADMIN" ? "r_admin" : "r_user",
      });
    } else if (isShowCreate) {
      form.resetFields();
      form.setFieldsValue({
        role: "r_user",
      });
    }
  }, [isShowEdit, isShowCreate, data, form]);

  const userInfoRaw = localStorage.getItem("user_info");
  const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;

  const handleCreateForSuperAdmin = async (value: IForm) => {
    if (value.password === value.re_password) {
      try {
        const createUser = await axios
          .post(
            `${process.env.REACT_APP_URL_API}/users`,
            {
              username: value.username,
              password: value.password,
              phone: value.phone,
              role: value.role === "r_admin" ? "ADMIN" : "USER",
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                accept: "*/*",
              },
            }
          )
          .then((res) => {
            if (res.status === 201) {
              onCancel();
              Swal.fire({
                icon: "success",
                title: "Tạo tài khoản thành công",
                text: `Tài khoản ${value.username} đã sẵn sàng sử dụng.`,
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
          })
          .catch((err) => {
            Swal.fire({
              icon: "error",
              title: "Lỗi tạo tài khoản",
              text: `${err?.response?.data?.message || "Không thể tạo tài khoản"}`,
              customClass: {
                popup: "custom-swal",
                title: "custom-title",
              },
            });
          });
      } catch (error) {
        return error;
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Mật khẩu không trùng khớp",
        text: "Vui lòng kiểm tra lại mật khẩu xác nhận.",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
        },
      });
    }
  };

  const handleCreateForAdmin = async (value: IForm) => {
    if (value.password === value.re_password) {
      try {
        const createUser = await axios
          .post(
            `${process.env.REACT_APP_URL_API}/auth/register`,
            {
              username: value.username,
              password: value.password,
              phone: value.phone,
              managedByUsername: userInfo?.userName || userInfo?.username || "superadmin",
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                accept: "*/*",
              },
            }
          )
          .then((res) => {
            if (res.status === 201) {
              onCancel();
              Swal.fire({
                icon: "success",
                title: "Tạo tài khoản thành công",
                text: `Tài khoản ${value.username} đã được tạo thành công.`,
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
          })
          .catch((err) => {
            Swal.fire({
              icon: "error",
              title: "Lỗi đăng ký",
              text: `${err?.response?.data?.message || "Không thể đăng ký"}`,
              customClass: {
                popup: "custom-swal",
                title: "custom-title",
              },
            });
          });
      } catch (error) {
        return error;
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Mật khẩu không trùng khớp",
        text: "Vui lòng kiểm tra lại mật khẩu xác nhận.",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
        },
      });
    }
  };

  const functionHandleCreate =
    userInfo?.role === "ADMIN" ? handleCreateForAdmin : handleCreateForSuperAdmin;

  const handleEdit = async (value: IForm) => {
    try {
      const payload: any = {
        username: value.username,
        phone: value.phone,
      };
      if (value.password) {
        payload.password = value.password;
      }

      await axios
        .put(`${process.env.REACT_APP_URL_API}/users/${data?._id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        })
        .then((res) => {
          if (res.status === 200) {
            onCanEdit();
            Swal.fire({
              icon: "success",
              title: "Cập nhật thành công",
              text: `Thông tin tài khoản ${value.username} đã được lưu.`,
              timer: 1500,
              timerProgressBar: true,
              customClass: {
                popup: "custom-swal",
                title: "custom-title",
              },
            });
            onRefesh();
          }
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "Lỗi cập nhật",
            text: `${err?.response?.data?.message || "Không thể cập nhật"}`,
            customClass: {
              popup: "custom-swal",
              title: "custom-title",
            },
          });
        });
    } catch (error) {
      return error;
    }
  };

  return (
    <Modal
      className="admin-modal"
      title={
        <span className="admin-modal-title-text">
          {isShowCreate ? "✨ Thêm Người Dùng Mới" : "📝 Cập Nhật Người Dùng"}
        </span>
      }
      open={isShowCreate || isShowEdit}
      onCancel={() => {
        onCanEdit();
        onCancel();
      }}
      footer={null}
      destroyOnClose
    >
      <Form
        onFinish={isShowCreate ? functionHandleCreate : handleEdit}
        form={form}
        layout="vertical"
        className="admin-form"
      >
        <Form.Item
          label={<span className="admin-form-label">Tên tài khoản (Username)</span>}
          name="username"
          rules={[{ required: true, message: "Vui lòng nhập tên tài khoản!" }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: "#ffd666", marginRight: 6 }} />}
            placeholder="Nhập tên tài khoản..."
          />
        </Form.Item>

        <Form.Item
          label={<span className="admin-form-label">Số điện thoại</span>}
          name="phone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input
            prefix={<PhoneOutlined style={{ color: "#ffd666", marginRight: 6 }} />}
            placeholder="Nhập số điện thoại (10 chữ số)..."
            maxLength={10}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="admin-form-label">
              {isShowCreate ? "Mật khẩu" : "Mật khẩu mới (Để trống nếu không đổi)"}
            </span>
          }
          name="password"
          rules={
            isShowCreate
              ? [{ required: true, message: "Vui lòng nhập mật khẩu!" }]
              : undefined
          }
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#ffd666", marginRight: 6 }} />}
            placeholder="Nhập mật khẩu..."
          />
        </Form.Item>

        {isShowCreate && (
          <Form.Item
            label={<span className="admin-form-label">Xác nhận mật khẩu</span>}
            name="re_password"
            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#ffd666", marginRight: 6 }} />}
              placeholder="Nhập lại mật khẩu..."
            />
          </Form.Item>
        )}

        {userInfo?.role === "SUPERADMIN" && (
          <Form.Item
            label={
              <span className="admin-form-label">
                <SafetyCertificateOutlined style={{ marginRight: 6 }} />
                Phân quyền tài khoản
              </span>
            }
            name="role"
          >
            <Radio.Group className="admin-radio-group">
              <Radio value="r_user" className="admin-radio">
                Người dùng (User)
              </Radio>
              <Radio value="r_admin" className="admin-radio">
                Quản trị viên (Admin)
              </Radio>
            </Radio.Group>
          </Form.Item>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-yellow-500/20">
          <Button
            className="admin-secondary-button"
            onClick={() => {
              onCanEdit();
              onCancel();
            }}
          >
            Đóng
          </Button>
          <Button className="admin-gold-button" htmlType="submit">
            {isShowCreate ? "Tạo tài khoản" : "Lưu thay đổi"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ModalUser;
