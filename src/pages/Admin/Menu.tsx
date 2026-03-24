import React, { useState } from "react";
import {
  AppstoreOutlined,
  HomeOutlined,
  MailOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import ListUser from "./ManageUser/ListUser";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    key: "1",
    icon: <HomeOutlined />,
    label: "Trang chủ",
  },
  {
    key: "2",
    icon: <UserOutlined />,
    label: "Quản lý User",
    children: [{ key: "11", label: "Danh sách User" }],
  },
];

interface LevelKeysProps {
  key?: string;
  children?: LevelKeysProps[];
}

const getLevelKeys = (items1: LevelKeysProps[]) => {
  const key: Record<string, number> = {};
  const func = (items2: LevelKeysProps[], level = 1) => {
    items2.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items1);
  return key;
};

const levelKeys = getLevelKeys(items as LevelKeysProps[]);

const MenuAdmin: React.FC = () => {
  const [stateOpenKeys, setStateOpenKeys] = useState(["2", "23"]);
  const [selectedKey, setSelectedKey] = useState("1");

  const onSelect: MenuProps["onSelect"] = ({ key }) => {
    setSelectedKey(key);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return <div>Trang chủ</div>;
      case "11":
        return <ListUser />;
      default:
        return <div>Chọn chức năng từ menu</div>;
    }
  };

  const onOpenChange: MenuProps["onOpenChange"] = (openKeys) => {
    const currentOpenKey = openKeys.find(
      (key) => stateOpenKeys.indexOf(key) === -1
    );
    // open
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setStateOpenKeys(
        openKeys
          // remove repeat key
          .filter((_, index) => index !== repeatIndex)
          // remove current level all child
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      );
    } else {
      // close
      setStateOpenKeys(openKeys);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Menu
        mode="inline"
        defaultSelectedKeys={[selectedKey]}
        onSelect={onSelect}
        style={{ width: 256, height: 1000 }}
        items={items}
      />
      <div style={{ padding: "20px", flex: 1 }}>{renderContent()}</div>
    </div>
  );
};

export default MenuAdmin;
