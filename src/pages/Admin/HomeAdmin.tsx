import React from "react";
import { ConfigProvider, theme } from "antd";
import HeaderAdmin from "./ManageUser/HeaderAdmin";
import MenuAdmin from "./Menu";
import "./Admin.css";

const HomeAdmin: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#f5c042",
          colorBgBase: "#0d0e12",
          colorBgContainer: "#17181e",
          colorBgElevated: "#1f2027",
          colorText: "#fbf2d0",
          colorTextSecondary: "#d6c18e",
          colorBorder: "rgba(245, 192, 66, 0.3)",
          colorBorderSecondary: "rgba(245, 192, 66, 0.18)",
          borderRadius: 10,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        },
        components: {
          Menu: {
            itemColor: "#e6d5a7",
            itemHoverColor: "#fff3bf",
            itemSelectedColor: "#2a1b02",
            itemSelectedBg: "#f5c042",
            subMenuItemBg: "transparent",
            itemBg: "transparent",
          },
          Table: {
            headerBg: "#221d12",
            headerColor: "#ffe58f",
            rowHoverBg: "rgba(245, 192, 66, 0.12)",
            borderColor: "rgba(245, 192, 66, 0.18)",
          },
          Input: {
            colorBgContainer: "rgba(10, 10, 14, 0.65)",
            colorText: "#ffffff",
            colorTextPlaceholder: "#8f8263",
            activeBorderColor: "#ffd666",
            hoverBorderColor: "#f5c042",
          },
          Modal: {
            contentBg: "#16161c",
            headerBg: "#16161c",
            titleColor: "#ffe28a",
          },
          Button: {
            primaryColor: "#2a1b02",
          },
        },
      }}
    >
      <div className="admin-shell">
        <HeaderAdmin />
        <MenuAdmin />
      </div>
    </ConfigProvider>
  );
};

export default HomeAdmin;
