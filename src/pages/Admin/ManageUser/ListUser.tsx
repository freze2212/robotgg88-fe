import React, { useEffect, useMemo, useState } from "react";
import { Button, Table, Tag, Tooltip, Input, Spin } from "antd";
import type { TableColumnsType } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  DollarCircleOutlined,
  CrownFilled,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ModalUser from "./ModalUser";
import { useConfirmModal } from "./ModalDelete";
import Swal from "sweetalert2";
import ModalAppCoin from "./ModalAppCoin";

export interface DataType {
  _id: string;
  username: string;
  phone: string;
  role: string;
  coins: number;
}

interface ListUserProps {
  initOpenCreate?: boolean;
  onResetInitOpen?: () => void;
}

const ListUser: React.FC<ListUserProps> = ({
  initOpenCreate = false,
  onResetInitOpen,
}) => {
  const [dataUser, setDataUser] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isShowCreate, setIsShowCreate] = useState(false);
  const [isShowEdit, setIsShowEdit] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const Cookie = require("js-cookie");
  const token = Cookie.get("access_token");
  const [dataEdit, setDataEdit] = useState<DataType>();
  const [isShowAppCoin, setIsShowAppCoin] = useState(false);
  const [idUser, setIdUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { showConfirm, contextHolder } = useConfirmModal();

  useEffect(() => {
    if (initOpenCreate) {
      setIsShowCreate(true);
      if (onResetInitOpen) onResetInitOpen();
    }
  }, [initOpenCreate, onResetInitOpen]);

  const handleDelete = (user: DataType) => {
    showConfirm({
      title: "Xác nhận xoá người dùng",
      content: (
        <span style={{ color: "#fbf2d0" }}>
          Bạn có chắc chắn muốn xoá tài khoản{" "}
          <strong style={{ color: "#ffd666" }}>{user.username}</strong> không?
        </span>
      ),
      okText: "Xoá tài khoản",
      cancelText: "Huỷ bỏ",
      onOk: async () => {
        try {
          const res = await axios.delete(
            `${process.env.REACT_APP_URL_API}/users/${user._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                accept: "*/*",
              },
            }
          );
          if (res.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Xoá tài khoản thành công",
              text: "Dữ liệu người dùng đã được loại bỏ.",
              timer: 1500,
              timerProgressBar: true,
              customClass: {
                popup: "custom-swal",
                title: "custom-title",
                icon: "custom-icon",
              },
            });
            setRefreshTrigger((prev) => prev + 1);
          }
        } catch (err: any) {
          Swal.fire({
            icon: "error",
            title: "Không thể xoá tài khoản",
            text: err?.response?.data?.message || "Đã xảy ra lỗi vui lòng thử lại.",
            customClass: {
              popup: "custom-swal",
              title: "custom-title",
            },
          });
        }
      },
    });
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: "TÀI KHOẢN",
      dataIndex: "username",
      key: "username",
      align: "left",
      render: (username: string) => {
        return (
          <div className="admin-user-cell">
            <div className="admin-user-avatar-mini">
              <UserOutlined />
            </div>
            <span className="admin-user-name-text">{username}</span>
          </div>
        );
      },
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      key: "role",
      align: "center",
      render: (role: string) => {
        const isSuper = role === "SUPERADMIN";
        const isAdmin = role === "ADMIN";
        return (
          <Tag
            className={`admin-table-badge ${
              isSuper
                ? "admin-table-badge--super"
                : isAdmin
                ? "admin-table-badge--admin"
                : "admin-table-badge--user"
            }`}
          >
            {isSuper || isAdmin ? <CrownFilled style={{ marginRight: 4 }} /> : null}
            {role || "USER"}
          </Tag>
        );
      },
    },
    {
      title: "SỐ ĐIỆN THOẠI",
      dataIndex: "phone",
      key: "phone",
      align: "center",
      render: (phone: string) => {
        return <span className="admin-table-phone">{phone ? phone.slice(0, 3) + "****" + phone.slice(-3) : "—"}</span>;
      },
    },
    {
      title: "SỐ DƯ (XU)",
      dataIndex: "coins",
      key: "coins",
      align: "right",
      render: (coins: number) => {
        const val = Number(coins) || 0;
        return (
          <div className="admin-table-coin">
            <DollarCircleOutlined className="admin-table-coin-icon" />
            <span>{val.toLocaleString("vi-VN")}</span>
          </div>
        );
      },
    },
    {
      title: "THAO TÁC",
      key: "action",
      align: "center",
      render: (_: any, data: DataType) => {
        return (
          <div className="admin-user-actions">
            <Tooltip title="Cộng / Trừ số xu">
              <Button
                className="admin-icon-button admin-icon-button--add"
                icon={<PlusCircleOutlined />}
                aria-label={`Điều chỉnh xu cho ${data.username}`}
                onClick={() => {
                  setIsShowAppCoin(true);
                  setIdUser(data._id);
                }}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa thông tin">
              <Button
                className="admin-icon-button admin-icon-button--edit"
                icon={<EditOutlined />}
                aria-label={`Sửa ${data.username}`}
                onClick={() => {
                  setIsShowEdit(true);
                  setDataEdit(data);
                }}
              />
            </Tooltip>
            <Tooltip title="Xoá người dùng">
              <Button
                className="admin-icon-button admin-icon-button--delete"
                icon={<DeleteOutlined />}
                aria-label={`Xóa ${data.username}`}
                onClick={() => handleDelete(data)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const userInfoRaw = localStorage.getItem("user_info");
    const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
    const uriUserList =
      userInfo?.role === "ADMIN"
        ? `${process.env.REACT_APP_URL_API}/users`
        : `${process.env.REACT_APP_URL_API}/users/all`;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(uriUserList, {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        });
        if (Array.isArray(response.data)) {
          const sortedData = response.data.sort((a: DataType, b: DataType) =>
            (b._id || "").localeCompare(a._id || "")
          );
          setDataUser(sortedData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, refreshTrigger]);

  const filteredUsers = useMemo(() => {
    return dataUser.filter((user: DataType) =>
      (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, dataUser]);

  return (
    <section className="admin-user-panel">
      {contextHolder}
      <div className="admin-user-panel__heading">
        <div>
          <span className="admin-user-panel__eyebrow">QUẢN LÝ THÀNH VIÊN</span>
          <div className="flex items-center gap-3 mt-1">
            <h1>Danh sách người dùng</h1>
            <Tag className="admin-count-badge">
              {filteredUsers.length} tài khoản
            </Tag>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="admin-secondary-button"
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            className="admin-gold-button"
            onClick={() => setIsShowCreate(true)}
          >
            <PlusCircleOutlined /> Tạo người dùng
          </Button>
        </div>
      </div>

      <div className="admin-search-wrap">
        <Input
          className="admin-search"
          prefix={<SearchOutlined style={{ color: "#ffd666", marginRight: 6 }} />}
          type="search"
          placeholder="Tìm kiếm tài khoản theo tên đăng nhập hoặc số điện thoại..."
          allowClear
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table<DataType>
        className="admin-user-table"
        columns={columns}
        dataSource={filteredUsers}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => (
            <span style={{ color: "#e8cf8d", fontSize: 13 }}>
              Hiển thị {range[0]}-{range[1]} trên tổng số {total} tài khoản
            </span>
          ),
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
      />

      <ModalUser
        isShowCreate={isShowCreate}
        isShowEdit={isShowEdit}
        onCanEdit={() => setIsShowEdit(false)}
        onCancel={() => setIsShowCreate(false)}
        onRefesh={() => setRefreshTrigger((prev) => prev + 1)}
        data={dataEdit}
      />

      <ModalAppCoin
        id={idUser}
        isShowCoin={isShowAppCoin}
        onCanCoin={() => setIsShowAppCoin(false)}
        onRefesh={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </section>
  );
};

export default ListUser;
