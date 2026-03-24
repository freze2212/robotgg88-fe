import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Radio } from "antd";
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
        name: data?.username, // giả sử `name` dùng `username` hiện tại
        username: data?.username,
        phone: data?.phone,
      });
    } else {
      form.resetFields();
    }
  }, [isShowEdit, data, form]);

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
              role: value.role === "r_admin"
                  ? "ADMIN"
                  : "USER",
            },
            {
              headers: {
                Authorization: `Bearer ${token} `,
                accept: "*/*",
              },
            }
          )
          .then((data) => {
            if (data.status === 201) {
              onCancel();
              Swal.fire({
                icon: "success",
                title: "Tạo tài khoản thành công",
                text: "Vui lòng đợi ít phút. ",
                timer: 1000,
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
              title: "Lỗi đăng ký",
              text: `${err.response.data.message}`,
              timer: 1000,
              timerProgressBar: true,
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
        text: "Vui lòng đợi ít phút. ",
        timer: 1000,
        timerProgressBar: true,
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
              managedByUsername: userInfo.userName,
            },
            {
              headers: {
                Authorization: `Bearer ${token} `,
                accept: "*/*",
              },
            }
          )
          .then((data) => {
            if (data.status === 201) {
              onCancel();
              Swal.fire({
                icon: "success",
                title: "Tạo tài khoản thành công",
                text: "Vui lòng đợi ít phút. ",
                timer: 1000,
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
              title: "Lỗi đăng ký",
              text: `${err.response.data.message}`,
              timer: 1000,
              timerProgressBar: true,
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
        text: "Vui lòng đợi ít phút. ",
        timer: 1000,
        timerProgressBar: true,
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
        },
      });
    }
  };
  let functionHandleCreate = userInfo.role === "ADMIN" ? handleCreateForAdmin : handleCreateForSuperAdmin;

  const handleEdit = async (value: IForm) => {
    try {
      await axios
        .put(
          `${process.env.REACT_APP_URL_API}/users/${data?._id}`,
          {
            username: value.username,
            phone: value.phone,
            password: value.password,
          },
          {
            headers: {
              Authorization: `Bearer ${token} `,
              accept: "*/*",
            },
          }
        )
        .then((data) => {
          if (data.status === 200) {
            onCanEdit();
            Swal.fire({
              icon: "success",
              title: "Cập nhật tài khoản thành công",
              text: "Vui lòng đợi ít phút. ",
              timer: 1000,
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
            title: "Lỗi ",
            text: `${err.response.data.message}`,
            timer: 1000,
            timerProgressBar: true,
            customClass: {
              popup: "custom-swal",
              title: "custom-title",
              htmlContainer: "custom-text",
            },
          });
        });
    } catch (error) {
      return error;
    }
  };
  return (
    <Modal
      title="Create User"
      open={isShowCreate || isShowEdit}
      onCancel={() => {
        onCanEdit();
        onCancel();
      }}
      footer={null}
    >
      <Form onFinish={isShowCreate ? functionHandleCreate : handleEdit} form={form}>
        <Form.Item
          label="UserName"
          name="username"
          labelCol={{ span: 24 }}
          rules={[{ required: true, message: "Please input your UserName!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="SDT"
          name="phone"
          labelCol={{ span: 24 }}
          rules={[{ required: true, message: "Please input your Phone!" }]}
        >
          <Input maxLength={10} />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          labelCol={{ span: 24 }}
          rules={
            isShowCreate
              ? [{ required: true, message: "Please input your Password!" }]
              : undefined
          }
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Nhập lại password"
          name="re_password"
          labelCol={{ span: 24 }}
          rules={
            isShowCreate
              ? [{ required: true, message: "Please input your Re-Password!" }]
              : undefined
          }
        >
          <Input.Password />
        </Form.Item>

        {userInfo?.role === "SUPERADMIN" && (
          <Form.Item label="Quyền Hạn" name="role">
            <Radio.Group defaultValue="r_user">
              <Radio value="r_admin">Admin</Radio>
              <Radio value="r_user">User</Radio>
            </Radio.Group>
          </Form.Item>
        )}


        <div className="flex justify-end gap-3">
          <Button className="bg-green-500 text-white" htmlType="submit">
            Lưu
          </Button>
          <Button
            onClick={() => {
              onCanEdit();
              onCancel();
            }}
          >
            Đóng
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ModalUser;
