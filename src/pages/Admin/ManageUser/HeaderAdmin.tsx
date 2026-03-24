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
    <div className="flex justify-end p-3 border-b-2">
      <Space direction="vertical" size={16}>
        <Space wrap size={16}>
          <Dropdown overlay={menu} trigger={["hover"]}>
            <Avatar
              size="large"
              icon={<UserOutlined />}
              style={{ cursor: "pointer" }}
            />
          </Dropdown>
        </Space>
      </Space>
    </div>
  );
};

export default HeaderAdmin;
