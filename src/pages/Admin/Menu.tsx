import React, { useState } from "react";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import ListUser from "./ManageUser/ListUser";
import DashboardOverview from "./DashboardOverview";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    key: "1",
    icon: <DashboardOutlined />,
    label: "Bảng điều khiển",
  },
  {
    key: "2",
    icon: <UserOutlined />,
    label: "Quản lý Người dùng",
    children: [
      {
        key: "11",
        icon: <TeamOutlined />,
        label: "Danh sách User",
      },
    ],
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
  const [stateOpenKeys, setStateOpenKeys] = useState(["2"]);
  const [selectedKey, setSelectedKey] = useState("1");
  const [triggerCreateUser, setTriggerCreateUser] = useState(false);

  const onSelect: MenuProps["onSelect"] = ({ key }) => {
    setSelectedKey(key);
  };

  const handleNavigateToUsers = () => {
    setSelectedKey("11");
    setStateOpenKeys(["2"]);
  };

  const handleOpenCreateUser = () => {
    setSelectedKey("11");
    setStateOpenKeys(["2"]);
    setTriggerCreateUser(true);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return (
          <DashboardOverview
            onNavigateToUsers={handleNavigateToUsers}
            onOpenCreateUser={handleOpenCreateUser}
          />
        );
      case "11":
        return (
          <ListUser
            initOpenCreate={triggerCreateUser}
            onResetInitOpen={() => setTriggerCreateUser(false)}
          />
        );
      default:
        return (
          <DashboardOverview
            onNavigateToUsers={handleNavigateToUsers}
            onOpenCreateUser={handleOpenCreateUser}
          />
        );
    }
  };

  const onOpenChange: MenuProps["onOpenChange"] = (openKeys) => {
    const currentOpenKey = openKeys.find(
      (key) => stateOpenKeys.indexOf(key) === -1
    );
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setStateOpenKeys(
        openKeys
          .filter((_, index) => index !== repeatIndex)
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      );
    } else {
      setStateOpenKeys(openKeys);
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar-wrapper">
        <Menu
          className="admin-sidebar"
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={stateOpenKeys}
          onOpenChange={onOpenChange}
          onSelect={onSelect}
          items={items}
        />
      </aside>
      <main className="admin-content">{renderContent()}</main>
    </div>
  );
};

export default MenuAdmin;
