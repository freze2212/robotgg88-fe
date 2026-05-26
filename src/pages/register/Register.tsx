import axios from "axios";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";

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

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      phone_number: "",
      password: "",
      password_confirmation: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (data: {
    username: string;
    phone_number: string;
    password: string;
    password_confirmation: string;
  }) => {
    if (data.password !== data.password_confirmation) return;

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_URL_API}/auth/register`,
        {
          username: data.username,
          managedByUsername: "superadmin",
          phone: data.phone_number,
          password: String(data.password),
        }
      );

      if (res.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Đăng ký thành công",
          text: "Vui lòng đợi ít phút.",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
          },
        });
        reset();
        onSwitchToLogin();
      }
    } catch (err: any) {
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="auth-modal__title">&gt;_ĐĂNG KÝ_&lt;</h1>
      <form
        className="auth-modal__form"
        onSubmit={handleSubmit(handleRegister)}
        noValidate
      >
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              className="auth-modal__input"
              type="text"
              placeholder="Tên tài khoản"
              autoComplete="username"
              maxLength={16}
            />
          )}
        />
        {errors.username && (
          <p className="auth-modal__error">{errors.username.message}</p>
        )}

        <Controller
          name="phone_number"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              className="auth-modal__input"
              type="tel"
              placeholder="Số điện thoại"
              autoComplete="tel"
              maxLength={10}
            />
          )}
        />
        {errors.phone_number && (
          <p className="auth-modal__error">{errors.phone_number.message}</p>
        )}

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              className="auth-modal__input"
              type="password"
              placeholder="Mật khẩu"
              autoComplete="new-password"
            />
          )}
        />
        {errors.password && (
          <p className="auth-modal__error">{errors.password.message}</p>
        )}

        <Controller
          name="password_confirmation"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              className="auth-modal__input"
              type="password"
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
            />
          )}
        />
        {errors.password_confirmation && (
          <p className="auth-modal__error">
            {errors.password_confirmation.message}
          </p>
        )}

        <button
          type="submit"
          className="auth-modal__submit"
          disabled={submitting}
        >
          &gt;ĐĂNG KÝ&lt;
        </button>
      </form>
      <p className="auth-modal__footer">
        Đã có tài khoản?{" "}
        <button
          type="button"
          className="auth-modal__link"
          onClick={onSwitchToLogin}
        >
          Đăng nhập ngay
        </button>
      </p>
    </>
  );
};

export default RegisterForm;
