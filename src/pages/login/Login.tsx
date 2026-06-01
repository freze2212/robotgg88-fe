import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import RegisterForm from "../register/Register";
import { getAssetUrl } from "../../utils/assetUrl";
import "./Login.css";

type AuthView = "login" | "register";

const swalPopupClass = {
  popup: "custom-swal",
  title: "custom-title",
  htmlContainer: "custom-text",
};

const Login: React.FC = () => {
  const Cookies = require("js-cookie");

  const [view, setView] = useState<AuthView>("login");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const bgUrl = `${process.env.PUBLIC_URL || ""}/assets/bg-pc.png`;

  useEffect(() => {
    document.documentElement.classList.add("login-scroll-lock");
    document.body.classList.add("login-scroll-lock");

    return () => {
      document.documentElement.classList.remove("login-scroll-lock");
      document.body.classList.remove("login-scroll-lock");
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userName.trim() === "" || password.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Lỗi đăng nhập",
        text: "Vui lòng điền đầy đủ thông tin",
        customClass: swalPopupClass,
      });
      return;
    }

    setSubmitting(true);
    try {
      Swal.fire({
        title: "Đang xử lý...",
        html: "<p class='swal-loading-subtext'>Vui lòng chờ trong giây lát</p><div class='swal-loading-dots'><span class='swal-dot swal-dot-cyan'></span><span class='swal-dot swal-dot-orange'></span></div>",
        customClass: {
          popup: "custom-swal swal-loading-modal",
          title: "custom-title",
          htmlContainer: "custom-text",
        },
        allowOutsideClick: false,
        showConfirmButton: false,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { data, status } = await axios.post(
        `${process.env.REACT_APP_URL_API}/auth/login`,
        {
          username: userName,
          password,
        }
      );

      localStorage.setItem(
        "user_info",
        JSON.stringify({
          userName: data.user.username,
          coins: data.user.coins,
          role: data.user.role,
          id: data.user._id,
        })
      );

      Cookies.set("access_token", data.access_token, {
        expires: 1 / 24,
        secure: false,
        sameSite: "Lax",
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const isAdmin =
        status === 201 &&
        (data.user.role === "SUPERADMIN" || data.user.role === "ADMIN");

      Swal.fire({
        icon: "success",
        title: "Đăng nhập thành công",
        text: isAdmin ? undefined : "Vui lòng đợi ít phút.",
        timer: 1200,
        showConfirmButton: false,
        customClass: swalPopupClass,
      });

      setTimeout(() => {
        window.location.href = isAdmin ? "/admin" : "/";
      }, 500);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Lỗi đăng nhập",
          text: "Tài khoản/mật khẩu không chính xác!",
          customClass: swalPopupClass,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div
        className="login-page__bg"
        style={{ backgroundImage: `url(${bgUrl})` }}
        aria-hidden
      />

      <div className="auth-modal">
        <div className="auth-modal__logo-wrap">
          <img
            src={getAssetUrl("/assets/logo.png")}
            alt="GG88"
            className="auth-modal__logo"
          />
        </div>

        {view === "login" ? (
          <>
            <h1 className="auth-modal__title">&gt;_ĐĂNG NHẬP_&lt;</h1>
            <form className="auth-modal__form" onSubmit={handleLogin} noValidate>
              <input
                className="auth-modal__input"
                type="text"
                id="txtUsername"
                placeholder="Tên đăng nhập"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                maxLength={16}
                minLength={4}
                autoComplete="username"
                required
              />
              <input
                className="auth-modal__input"
                type="password"
                id="txtPassword"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={16}
                minLength={4}
                autoComplete="current-password"
                required
              />
              <button
                type="submit"
                className="auth-modal__submit"
                disabled={submitting}
              >
                &gt;ĐĂNG NHẬP&lt;
              </button>
            </form>
            <p className="auth-modal__footer">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                className="auth-modal__link"
                onClick={() => setView("register")}
              >
                Đăng ký ngay
              </button>
            </p>
          </>
        ) : (
          <RegisterForm onSwitchToLogin={() => setView("login")} />
        )}
      </div>
    </div>
  );
};

export default Login;
