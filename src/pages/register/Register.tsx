import axios from "axios";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Input, Form } from "antd";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";
import { getAssetUrl } from "../../utils/assetUrl";

interface IProps {
  isRegister: boolean;
  setIsRegister: () => void;
  setIsShowLogin: () => void;
}

const schema = yup.object().shape({
  username: yup.string().required("Tên tài khoản bắt buộc"),
  phone_number: yup
    .string()
    .matches(/^\d{10}$/, "Số điện thoại phải có 10 chữ số")
    .required("Số điện thoại bắt buộc"),
  password: yup.string().min(6, "Mật khẩu ít nhất 6 ký tự").required(),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
    .required("Vui lòng nhập lại mật khẩu"),
});

const Register: React.FC<IProps> = ({
  isRegister,
  setIsRegister,
  setIsShowLogin,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleRegister = async (data: any) => {
    if (data.password === data.password_confirmation) {
      try {
        await axios
          .post(`${process.env.REACT_APP_URL_API}/auth/register`, {
            username: data.username,
            managedByUsername: "superadmin",
            phone: data.phone_number,
            password: String(data.password),
          })
          .then((data) => {
            if (data.status === 201) {
              Swal.fire({
                icon: "success",
                title: "Đăng ký thành công",
                text: "Vui lòng đợi ít phút. ",
                customClass: {
                  popup: "custom-swal",
                  title: "custom-title",
                  htmlContainer: "custom-text",
                },
              });
              setIsRegister();
              setIsShowLogin();
              reset();
            }
          })
          .catch((err) => {
            Swal.fire({
              icon: "error",
              title: "Lỗi đăng ký",
              text: `${err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!"}`,
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
    }
  };

  return (
    <div
      className={`model-item model-register 
            ${isRegister ? "model-register_active" : ""} `}
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL || ""}/assets/modal-login.png)`,
      }}
    >
      <div className="btn-closeModel" onClick={setIsRegister}></div>
      <div className="wrapper">
        <div className="title mb-4">
          <img
            src={getAssetUrl("/assets/text-register.png")}
            alt="Đăng ký"
            className="img-title-register"
          />
        </div>
        <Form id="regisform" onFinish={handleSubmit(handleRegister)}>
          <Form.Item
            validateStatus={errors.username ? "error" : ""}
            help={errors.username?.message}
          >
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  className="bg-input mb-3 placeholder-white"
                  placeholder="Tên tài khoản"
                />
              )}
            />
          </Form.Item>

          {/* Trường 'Mã AI' đã được loại bỏ theo yêu cầu */}

          <Form.Item
            validateStatus={errors.phone_number ? "error" : ""}
            help={errors.phone_number?.message}
          >
            <Controller
              name="phone_number"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  className="bg-input mb-3 placeholder-white"
                  placeholder="Số điện thoại"
                  maxLength={10}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            validateStatus={errors.password ? "error" : ""}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  className="bg-input mb-3 placeholder-white"
                  placeholder="Mật khẩu"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            validateStatus={errors.password_confirmation ? "error" : ""}
            help={errors.password_confirmation?.message}
          >
            <Controller
              name="password_confirmation"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  className="bg-input mb-3 placeholder-white"
                  placeholder="Nhập lại mật khẩu"
                />
              )}
            />
          </Form.Item>

          {/* Captcha giữ nguyên như bạn đang có */}

          {/* Nút bấm giữ nguyên CSS */}
          <div className="group-btn mt-4">
            <button type="button" className="btn-cancel">Hủy</button>
            <button type="submit" className="btn-confirm">Đồng ý</button>
          </div>
        </Form>
        <p className="txt-swith">
          Đã có tài khoản?{" "}
          <span
            className="link-login"
            onClick={() => {
              setIsRegister();
              setIsShowLogin();
            }}
          >
            Đăng nhập ngay
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
