import React, { useEffect, useState } from "react";
import {
  UsergroupAddOutlined,
  DollarCircleOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { Card, Row, Col, Button, Tag } from "antd";
import axios from "axios";

interface DashboardOverviewProps {
  onNavigateToUsers: () => void;
  onOpenCreateUser: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateToUsers,
  onOpenCreateUser,
}) => {
  const [userCount, setUserCount] = useState<number>(0);
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>("");

  const Cookie = require("js-cookie");
  const token = Cookie.get("access_token");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfoRaw = localStorage.getItem("user_info");
        const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
        const uri =
          userInfo?.role === "ADMIN"
            ? `${process.env.REACT_APP_URL_API}/users`
            : `${process.env.REACT_APP_URL_API}/users/all`;

        const res = await axios.get(uri, {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        });

        if (Array.isArray(res.data)) {
          setUserCount(res.data.length);
          const sumCoins = res.data.reduce(
            (acc: number, cur: any) => acc + (Number(cur.coins) || 0),
            0
          );
          setTotalCoins(sumCoins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div className="admin-dashboard-container">
      {/* Welcome Banner */}
      <div className="admin-banner-card">
        <div className="admin-banner-content">
          <div className="admin-banner-pill">
            <span className="admin-live-dot"></span>
            <span>HỆ THỐNG ĐANG HOẠT ĐỘNG ỔN ĐỊNH</span>
          </div>
          <h1 className="admin-banner-title">
            BẢNG ĐIỀU KHIỂN HOÀNG KIM GG88
          </h1>
          <p className="admin-banner-desc">
            Giám sát thời gian thực, quản lý thành viên, cấp phát số dư và điều
            phối hệ sinh thái trò chơi casino &amp; nổ hũ tự động.
          </p>
          <div className="admin-banner-meta">
            <span>🕒 {currentTime}</span>
          </div>
        </div>
        <div className="admin-banner-actions">
          <Button
            type="primary"
            className="admin-gold-button admin-banner-btn"
            onClick={onNavigateToUsers}
          >
            Quản lý tài khoản <ArrowRightOutlined />
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <Row gutter={[20, 20]} className="admin-stats-row">
        <Col xs={24} sm={12} lg={6}>
          <div className="admin-stat-card">
            <div className="admin-stat-icon admin-stat-icon--users">
              <UsergroupAddOutlined />
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">Tổng người dùng</span>
              <div className="admin-stat-value">
                {loading ? "..." : userCount.toLocaleString("vi-VN")}
              </div>
              <span className="admin-stat-sub">
                <RiseOutlined style={{ marginRight: 4 }} />
                Tài khoản đăng ký
              </span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="admin-stat-card">
            <div className="admin-stat-icon admin-stat-icon--coins">
              <DollarCircleOutlined />
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">Tổng xu lưu hành</span>
              <div className="admin-stat-value admin-stat-value--gold">
                {loading ? "..." : totalCoins.toLocaleString("vi-VN")}
              </div>
              <span className="admin-stat-sub">
                <CheckCircleFilled style={{ color: "#52c41a", marginRight: 4 }} />
                Ví thành viên
              </span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="admin-stat-card">
            <div className="admin-stat-icon admin-stat-icon--speed">
              <ThunderboltOutlined />
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">Engine Dự Đoán</span>
              <div className="admin-stat-value admin-stat-value--active">
                SẴN SÀNG
              </div>
              <span className="admin-stat-sub">
                Tốc độ phản hồi &lt; 25ms
              </span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="admin-stat-card">
            <div className="admin-stat-icon admin-stat-icon--shield">
              <SafetyCertificateOutlined />
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">Bảo mật hệ thống</span>
              <div className="admin-stat-value admin-stat-value--secure">
                CẤP ĐỘ CAO
              </div>
              <span className="admin-stat-sub">
                Mã hóa Token 256-bit
              </span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick Access Cards */}
      <Row gutter={[20, 20]} className="admin-quick-row">
        <Col xs={24} md={12}>
          <Card className="admin-card-glass">
            <h3 className="admin-card-title">
              <span className="admin-card-title-icon">⚡</span>
              Lối tắt quản trị
            </h3>
            <p className="admin-card-desc">
              Các thao tác nhanh dành cho ban quản trị hệ thống.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                type="primary"
                className="admin-gold-button"
                onClick={onNavigateToUsers}
              >
                <UsergroupAddOutlined /> Danh sách thành viên
              </Button>
              <Button
                className="admin-secondary-button"
                onClick={onOpenCreateUser}
              >
                + Thêm thành viên mới
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card className="admin-card-glass">
            <h3 className="admin-card-title">
              <span className="admin-card-title-icon">🛡️</span>
              Quy chuẩn vận hành
            </h3>
            <div className="admin-rules-list">
              <div className="admin-rule-item">
                <span className="admin-rule-bullet">✦</span>
                <span>Kiểm tra số dư xu trước khi duyệt hoặc điều chỉnh tài khoản.</span>
              </div>
              <div className="admin-rule-item">
                <span className="admin-rule-bullet">✦</span>
                <span>Đảm bảo quyền hạn Admin được cấp phát đúng đối tượng.</span>
              </div>
              <div className="admin-rule-item">
                <span className="admin-rule-bullet">✦</span>
                <span>Hệ thống ghi nhận nhật ký mọi thao tác thêm/trừ coin.</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
