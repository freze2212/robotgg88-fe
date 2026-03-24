import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import "./css/main.login.css";
import Register from "../register/Register";
import { getAssetUrl } from "../../utils/assetUrl";

const Login: React.FC = () => {
  const Cookies = require("js-cookie");
  const navagate = useNavigate();

  const [isShowLoginForm, setIsShowLoginForm] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("login-scroll-lock");
    document.body.classList.add("login-scroll-lock");

    let scene: THREE.Scene,
      camera: THREE.PerspectiveCamera,
      renderer: THREE.WebGLRenderer;
    const LINE_COUNT = 1000;
    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(6 * LINE_COUNT), 3)
    );
    geom.setAttribute(
      "velocity",
      new THREE.BufferAttribute(new Float32Array(2 * LINE_COUNT), 1)
    );
    const pos = geom.getAttribute("position");
    const pa = pos.array;
    const vel = geom.getAttribute("velocity");
    const va = vel.array;

    const initParticles = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      camera.position.z = 500;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      document.body.appendChild(renderer.domElement);

      for (let i = 0; i < LINE_COUNT; i++) {
        const x = Math.random() * window.innerWidth - window.innerWidth / 2;
        const y = Math.random() * window.innerHeight - window.innerHeight / 2;
        const z = Math.random() * 200 - 100;

        pa[6 * i] = x;
        pa[6 * i + 1] = y;
        pa[6 * i + 2] = z;
        pa[6 * i + 3] = x;
        pa[6 * i + 4] = y;
        pa[6 * i + 5] = z;

        va[2 * i] = 0;
        va[2 * i + 1] = 0;
      }

      const mat = new THREE.LineBasicMaterial({ color: 0x00BFFF });
      const lines = new THREE.LineSegments(geom, mat);
      scene.add(lines);
      window.addEventListener("resize", onWindowResize, false);
      animateParticles();
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const animateParticles = () => {
      for (let i = 0; i < LINE_COUNT; i++) {
        va[2 * i] += 0.03;
        va[2 * i + 1] += 0.025;
        pa[6 * i + 2] += va[2 * i];
        pa[6 * i + 5] += va[2 * i + 1];

        // Reset particle nếu vượt qua chiều cao của viewport
        if (pa[6 * i + 5] > 100) {
          const z = Math.random() * 200 - 100;
          const x = Math.random() * window.innerWidth - window.innerWidth / 2;
          const y = Math.random() * window.innerHeight - window.innerHeight / 2;

          pa[6 * i] = x;
          pa[6 * i + 1] = y;
          pa[6 * i + 2] = z;
          pa[6 * i + 3] = x;
          pa[6 * i + 4] = y;
          pa[6 * i + 5] = z;

          va[2 * i] = 0;
          va[2 * i + 1] = 0;
        }
      }

      pos.needsUpdate = true;
      renderer.render(scene, camera);
      requestAnimationFrame(animateParticles);
    };

    initParticles(); // Hiệu ứng mưa sao Three.js

    return () => {
      // Cleanup
      document.documentElement.classList.remove("login-scroll-lock");
      document.body.classList.remove("login-scroll-lock");
      window.removeEventListener("resize", onWindowResize);
      renderer?.dispose();
      if (renderer?.domElement && document.body.contains(renderer.domElement)) {
        document.body.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleLogin = async () => {
    const format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

    if (userName.trim() === "" || password.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Lỗi đăng nhập",
        text: "Vui lòng điền đầy đủ thông tin",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
        },
      });
      return;
    } else if (userName.trim() != "" || password.trim() != "") {
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

        // Chờ 3 giây
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await axios
          .post(`${process.env.REACT_APP_URL_API}/auth/login`, {
            username: userName,
            password,
          })
          .then(async (data) => {
            localStorage.setItem(
              "user_info",
              JSON.stringify({
                userName: data.data.user.username,
                coins: data.data.user.coins,
                role: data.data.user.role,
                id: data.data.user._id,
              })
            );

            Cookies.set("access_token", data.data.access_token, {
              expires: 1 / 24,
              secure: false, // Thử false cho iOS
              sameSite: "Lax", // Thử Lax thay vì Strict
            });

            await new Promise((resolve) => setTimeout(resolve, 100));

            if (data.status === 201 && (data.data.user.role === "SUPERADMIN" || data.data.user.role === "ADMIN")) {
              Swal.fire({
                icon: "success",
                title: "Đăng nhập thành công",
                customClass: {
                  popup: "custom-swal",
                  title: "custom-title",
                  htmlContainer: "custom-text",
                },
              });
              setTimeout(() => {
                window.location.href = "/admin";
              }, 500);
            } else {
              Swal.fire({
                icon: "success",
                title: "Đăng nhập thành công",
                text: "Vui lòng đợi ít phút. ",
                customClass: {
                  popup: "custom-swal",
                  title: "custom-title",
                  htmlContainer: "custom-text",
                },
              });
              setTimeout(() => {
                window.location.href = "/";
              }, 500);
            }
          })
          .catch((err) => {
            if (err.status === 401) {
              Swal.fire({
                icon: "error",
                title: "Lỗi đăng nhập",
                text: "Tài khoản/mật khẩu không chính xác!",
                customClass: {
                  popup: "custom-swal",
                  title: "custom-title",
                  htmlContainer: "custom-text",
                },
              });
            }
          });
      } catch (error) {
        return error;
      }
    }
  };

  return (
    <div className="login-page ">
      {/* Background Video */}
      <video 
        className="bgLogin"
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="/assets/bg-mb.mp4" type="video/mp4" media="(max-width: 768px)" />
        <source src="/assets/bg-pc.mp4" type="video/mp4" />
      </video>

      {/* Banner Logo Top */}
      <div className="login-top-banner">
        <img
          src={getAssetUrl("/assets/banner-logo.png")}
          alt="TOOL G8 Banner"
          className="login-top-banner-img"
        />
      </div>
      
      {/* Text Header + Text Title */}
      <div className="header-with-title">
        <img
          src={getAssetUrl("/assets/text-header.png")}
          alt="Header"
          className="text-header text-header-desktop"
        />
        <img
          src={getAssetUrl("/assets/text-header.png")}
          alt="Header"
          className="text-header text-header-mobile"
        />
        <img
          src={getAssetUrl("/assets/text-title.png")}
          alt="Title"
          className="text-title"
        />
      </div>

      {/* Robot Title */}
      <img 
src={getAssetUrl("/assets/banner-tool.png")}
        alt="Banner"
        className="robot-title"
      />

      {/* Text Footer + Link truy cập */}
      <div className="footer-with-link">
        <img 
          src={getAssetUrl("/assets/text-bottom-login.png")}
          alt="Footer" 
          className="text-footer text-footer-desktop"
        />
        <img 
          src={getAssetUrl("/assets/text-bottom-login.png")}
          alt="Footer" 
          className="text-footer text-footer-mobile"
        />
        <img 
          src={getAssetUrl("/assets/link-truy-cap.png")}
          alt="Link truy cập"
          className="link-truy-cap"
        />
      </div>

      {/* Robot GIF */}
      <img
        src={getAssetUrl("/assets/robot.gif")}
        alt="Robot"
        className="robot-video"
      />

      {/* Facebook Icon */}
      <a 
        href="https://www.facebook.com/profile.php?id=100089597561391" 
        target="_blank" 
        rel="noopener noreferrer"
        className="facebook-link"
      >
        <img 
          src={getAssetUrl("/assets/fb.png")} 
          alt="Facebook"
          className="facebook-icon"
        />
      </a>

      {/* Telegram Icon */}
      <a 
        href="https://t.me/TKTONGJEN" 
        target="_blank" 
        rel="noopener noreferrer"
        className="telegram-link"
      >
        <img 
          src={getAssetUrl("/assets/tele.png")} 
          alt="Telegram"
          className="telegram-icon"
        />
      </a>

      <div
        className={`model-group ${
          isShowLoginForm || isRegister || isLogin ? "active" : ""
        }`}
      >
        <div className="overlay"></div>

        {/* Login Modal */}
        <div
          className={`model-item model-login ${
            isShowLoginForm || isLogin ? "model-login_active" : ""
          }  `}
          style={{
            backgroundImage: `url(${process.env.PUBLIC_URL || ""}/assets/modal-login.png)`,
          }}
        >
          <div
            className="btn-closeModel"
            onClick={() => {
              setIsShowLoginForm(false);
              setIsLogin(false);
            }}
          ></div>
          <img
            src={getAssetUrl("/assets/text-login.png")}
            alt="Đăng nhập"
            className="miniTxt img-title-login"
          />

          <div className="wrapper">
            <div className="title mb-2"></div>
            <form
              id="loginform"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <input
                className="bg-input mb-3"
                type="text"
                id="txtUsername"
                placeholder="Tên đăng nhập"
                onChange={(e) => setUserName(e.target.value)}
                maxLength={16}
                minLength={4}
                autoComplete="off"
                required
              />
              <input
                className="bg-input mb-3"
                type="password"
                id="txtPassword"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                maxLength={16}
                minLength={4}
                autoComplete="off"
                required
              />
              <div className="group-btn mt-4">
                <button type="button" className="btn-cancel">Hủy</button>
                <button
                  type="submit"
                  className="btn-confirm"
                >
                  Đồng ý
                </button>
              </div>
            </form>
            <p className="txt-swith">
              Chưa có tài khoản?{" "}
              <span
                className="link-register"
                onClick={() => {
                  setIsShowLoginForm(false);
                  setIsRegister(true);
                }}
              >
                Đăng ký ngay
              </span>
            </p>
          </div>
        </div>

        {/* Register Modal */}
        <Register
          isRegister={isRegister}
          setIsShowLogin={() => setIsLogin(true)}
          setIsRegister={() => setIsRegister(false)}
        />
      </div>

      <div className="index-page_wrapper">
        <div id="bg-canvas">
          <canvas
            className="particles-js-canvas-el"
            width="1366"
            height="641"
          ></canvas>
        </div>
        <div className="logo">
          <img
            src="https://trumcasino6789.com/images/logo.png"
            alt="Logo"
            className="logo_main"
          />
          <div className="wrapper-content">
            <div className="group-btn">
              <img
                src={getAssetUrl("/assets/btn-login.png")}
                alt="Đăng nhập"
                className="btn-item btn-login"
                onClick={() => setIsShowLoginForm(true)}
                role="button"
              />
              <img
                src={getAssetUrl("/assets/btn-register.png")}
                alt="Đăng ký"
                className="btn-item btn-register"
                onClick={() => setIsRegister(true)}
                role="button"
              />
            </div>
            <div className="group-btn-download">
              <img
                src={getAssetUrl("/assets/download-app.png")}
                alt="Tải ứng dụng"
                className="btn-item btn-download"
                role="button"
              />
            </div>
            <div className="casino-logos">
              <img
                src={getAssetUrl("/assets/menu-sanh.png")}
                alt="Menu sảnh"
                className="menu-sanh menu-sanh-desktop"
              />
              <img
                src={getAssetUrl("/assets/menu-game.png")}
                alt="Menu game"
                className="menu-sanh menu-sanh-mobile"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
