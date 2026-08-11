import React from "react";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu, Space } from "antd";

const HeaderAdmin = () => {
  const Cookies = require("js-cookie");

  const handleLogout = () => {
    Cookies.remove("access_token");
    window.location.reload();
  };

  const menu = (
    <Menu
      items={[
        {
          key: "logout",
          label: <span onClick={handleLogout}>Đăng xuất</span>,
          icon: <LogoutOutlined />,
        },
      ]}
    />
  );
  return (
    <header className="admin-header">
      <div className="admin-header__brand">
        <span className="admin-header__eyebrow">GG88 CONTROL</span>
        <strong>TRUNG TÂM QUẢN TRỊ</strong>
      </div>
      <Space direction="vertical" size={16}>
        <Space wrap size={16}>
          <Dropdown overlay={menu} trigger={["hover"]}>
            <Avatar
              className="admin-header__avatar"
              size="large"
              icon={<UserOutlined />}
              style={{ cursor: "pointer" }}
            />
          </Dropdown>
        </Space>
      </Space>
    </header>
  );
};

export default HeaderAdmin;
