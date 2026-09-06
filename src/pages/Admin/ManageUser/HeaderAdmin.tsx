import React from "react";
import { LogoutOutlined, UserOutlined, CrownFilled, SafetyCertificateOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, MenuProps, Space, Tag } from "antd";

const HeaderAdmin: React.FC = () => {
  const Cookies = require("js-cookie");

  const userInfoRaw = localStorage.getItem("user_info");
  const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
  const username = userInfo?.userName || userInfo?.username || "Admin";
  const role = userInfo?.role || "ADMIN";

  const handleLogout = () => {
    Cookies.remove("access_token");
    localStorage.removeItem("user_info");
    window.location.href = "/login";
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div className="admin-dropdown-user-header">
          <div className="admin-dropdown-user-name">{username}</div>
          <div className="admin-dropdown-user-role">
            <SafetyCertificateOutlined /> {role}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined className="text-red-400" />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="admin-header">
      <div className="admin-header__brand">
        <div className="flex items-center gap-2">
          <CrownFilled className="admin-header__crown" />
          <span className="admin-header__eyebrow">GG88 SYSTEM CONTROL</span>
        </div>
        <strong>TRUNG TÂM QUẢN TRỊ CAO CẤP</strong>
      </div>

      <div className="admin-header__right">
        <div className="admin-header__user-pill">
          <Tag className="admin-role-badge">
            <CrownFilled style={{ marginRight: 4 }} />
            {role}
          </Tag>
          <span className="admin-header__username">{username}</span>
        </div>

        <Dropdown
          menu={{ items: menuItems }}
          trigger={["click", "hover"]}
          placement="bottomRight"
          overlayClassName="admin-dropdown-menu"
        >
          <Avatar
            className="admin-header__avatar"
            size={42}
            icon={<UserOutlined />}
            style={{ cursor: "pointer" }}
          />
        </Dropdown>
      </div>
    </header>
  );
};

export default HeaderAdmin;
