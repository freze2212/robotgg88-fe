import React, { useEffect, useMemo, useState } from "react";
import { Button, Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ModalUser from "./ModalUser";
import { useConfirmModal } from "./ModalDelete";
import Swal from "sweetalert2";
import ModalAppCoin from "./ModalAppCoin";
import Input from "antd/es/input/Input";

type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];

export interface DataType {
  _id: string;
  username: string;
  phone: string;
  role: string;
  coins: number;
}

const ListUser: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataUser, setDataUser] = useState([]);
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

  const handleDelete = (user: DataType) => {
    showConfirm({
      title: "Xoá người dùng",
      content: `Bạn có chắc muốn xoá người dùng ${user.username} không?`,
      onOk: async () => {
        await axios
          .delete(`${process.env.REACT_APP_URL_API}/users/${user._id}`, {
            headers: {
              Authorization: `Bearer ${token} `,
              accept: "*/*",
            },
          })
          .then((data) => {
            if (data.status === 200) {
              Swal.fire({
                icon: "success",
                title: "Xoá tài khoản thành công",
                text: "Vui lòng đợi ít phút. ",
                timer: 1000,
                timerProgressBar: true,
                customClass: {
                  popup: "custom-swal",
                  title: "custom-title",
                  icon: "custom-icon",
                },
              });
              setRefreshTrigger((prev) => prev + 1);
            }
          })
          .catch((err) => {
            return err;
          });
      },
    });
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: "Name",
      align: "center",
      render: (data: DataType) => {
        return data.username;
      },
    },
    {
      title: "Role",
      align: "center",
      render: (data: DataType) => {
        return data.role;
      },
    },
    {
      title: "Phone",
      align: "center",
      render: (data: DataType) => {
        return "****";
      },
    },
    {
      title: "COINS",
      align: "center",
      render: (data: DataType) => {
        return data.coins;
      },
    },
    {
      title: "Action",
      align: "center",
      render: (data: DataType) => {
        return (
          <div className="flex gap-3 justify-center items-center">
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => {
                setIsShowAppCoin(true);
                setIdUser(data._id);
              }}
            />
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setIsShowEdit(true);
                setDataEdit(data);
              }}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(data)}
            />
            {contextHolder}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const userInfoRaw = localStorage.getItem("user_info");
    const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
    const uriUserList = userInfo.role === "ADMIN" ? `${process.env.REACT_APP_URL_API}/users` : `${process.env.REACT_APP_URL_API}/users/all`;
    const fetchData = async () => {
      try {
        const response = await axios.get(
          uriUserList,
          {
            headers: {
              Authorization: `Bearer ${token} `,
              accept: "*/*",
            },
          }
        );
        const sortedData = response.data.sort((a: DataType, b: DataType) =>
          b._id.localeCompare(a._id)
        );

        setDataUser(sortedData);
      } catch (err) {
        return err;
      }
    };

    fetchData();
  }, [token, refreshTrigger]);

  const filteredUsers = useMemo(() => {
    return dataUser.filter((user: DataType) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, dataUser]);

  return (
    <div className="flex grid gap-5">
      <div className="flex justify-end">
        <Button
          type="primary"
          className="bg-blue-500 "
          onClick={() => setIsShowCreate(true)}
        >
          Create
        </Button>
      </div>
      <Input
        type="search"
        placeholder="Tìm theo tên người dùng..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Table<DataType> columns={columns} dataSource={filteredUsers} />
      <ModalUser
        isShowCreate={isShowCreate}
        isShowEdit={isShowEdit}
        onCanEdit={() => setIsShowEdit(false)}
        onCancel={() => setIsShowCreate(false)}
        onRefesh={() => setRefreshTrigger((pev) => pev + 1)}
        data={dataEdit}
      />
      <ModalAppCoin
        id={idUser}
        isShowCoin={isShowAppCoin}
        onCanCoin={() => setIsShowAppCoin(false)}
        onRefesh={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
};

export default ListUser;
