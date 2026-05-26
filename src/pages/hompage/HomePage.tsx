import { useMemo, useState } from "react";
import Header from "../../components/Header";
import Gg88GameTypeModal from "../../components/Gg88GameTypeModal";
import ModalConfirmLogout from "../../components/ModalConfirmLogout";
import { getAssetUrl } from "../../utils/assetUrl";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const LOGIN_PREFIXES = [
  "iron",
  "slot",
  "zeus",
  "neo",
  "ghost",
  "king",
  "vip",
  "max",
  "pro",
  "win",
  "bet",
  "ace",
];

function buildLoginFeedLines(count: number): string[] {
  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    const prefix =
      LOGIN_PREFIXES[Math.floor(Math.random() * LOGIN_PREFIXES.length)];
    const suffix = String(Math.floor(Math.random() * 900) + 100);
    lines.push(`${prefix}${suffix}`);
  }
  return lines;
}

const HomePage = () => {
  const [isShowLogout, setIsShowLogout] = useState(false);
  const [showGg88GameModal, setShowGg88GameModal] = useState(false);
  const navigate = useNavigate();

  const statusLines = useMemo(() => buildLoginFeedLines(14), []);
  const statusFeedLines = useMemo(
    () => [...statusLines, ...statusLines],
    [statusLines]
  );

  return (
    <div className="page-with-header home-page">
      <Header setIsShowLogout={() => setIsShowLogout(true)} />

      <div className="home-hub">
        <h1 className="home-hub__title">VÀO SẢNH GG88</h1>

        <div className="home-hub__grid">
          {/* Trái — Hướng dẫn & VIP */}
          <aside className="home-panel home-panel--guide">
            <h2 className="home-panel__head">HƯỚNG DẪN &amp; VIP</h2>
            <div className="home-panel__body">
              <h3 className="home-panel__section-title">
                HƯỚNG DẪN ĐĂNG KÝ
              </h3>
              <ol className="home-panel__steps">
                <li>
                  Truy cập trang chủ GG88 và chọn mục Đăng ký tài khoản mới.
                </li>
                <li>
                  Điền đầy đủ thông tin, xác minh số điện thoại và hoàn tất đăng
                  ký.
                </li>
              </ol>

              <h3 className="home-panel__section-title">
                NÂNG CẤP VIP MEMBER
              </h3>
              <p className="home-panel__text">
                Trở thành VIP để nhận ưu đãi nạp, hoàn trả và hỗ trợ kỹ thuật
                ưu tiên khi sử dụng tool dự đoán GG88.
              </p>

              <div className="home-panel__vip-box">
                <p>
                  <strong>Nạp tích lũy tối thiểu 3,000,000 VNĐ</strong> để được
                  xét duyệt nâng hạng VIP Member.
                </p>
              </div>

              <button
                type="button"
                className="home-panel__btn"
                onClick={() => navigate("/casino/lobby")}
              >
                KẾT NỐI NGAY
              </button>
            </div>
          </aside>

          {/* Giữa — GG88 */}
          <section className="home-panel home-panel--main" aria-label="GG88">
            <div className="home-panel__card">
              <div className="home-panel__logo-wrap">
                <img
                  src={getAssetUrl("/assets/logo-gg88.png")}
                  alt="GG88"
                  className="home-panel__logo"
                />
              </div>
              <p className="home-panel__brand">GG88</p>
              <button
                type="button"
                className="home-panel__btn"
                onClick={() => setShowGg88GameModal(true)}
              >
                KÍCH HOẠT TOOL
              </button>
            </div>
          </section>

          {/* Phải — Trạng thái hệ thống */}
          <aside className="home-panel home-panel--status">
            <h2 className="home-panel__head home-panel__head--status">
              <span className="home-panel__head-dot" aria-hidden />
              TRẠNG THÁI HỆ THỐNG
            </h2>
            <div className="home-panel__body">
              <div className="home-status-feed" aria-live="polite">
                <div className="home-status-feed__track">
                  {statusFeedLines.map((user, i) => (
                    <p className="home-status-feed__line" key={`${user}-${i}`}>
                      <span className="home-status-feed__user">{user}</span> vừa
                      đăng nhập vào hệ thống
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Gg88GameTypeModal
        isOpen={showGg88GameModal}
        onClose={() => setShowGg88GameModal(false)}
      />

      <ModalConfirmLogout
        isShowLogout={isShowLogout}
        setIsShowLogout={() => setIsShowLogout(false)}
      />
    </div>
  );
};

export default HomePage;
