import { Modal, Form, Input, Button, Checkbox, Radio } from "antd";
import axios from "axios";
import Swal from "sweetalert2";

interface IProps {
  isShowCoin: boolean;
  onCanCoin: () => void;
  id: string;
  onRefesh: () => void;
}

const ModalAppCoin: React.FC<IProps> = ({
  isShowCoin,
  onCanCoin,
  id,
  onRefesh,
}) => {
  const Cookie = require("js-cookie");
  const token = Cookie.get("access_token");

  const handleAppCoin = async (value: any) => {
    if (value.coin !== 0) {
      try {
        const endpoint =
          value.type === "removeCoin"
            ? `${process.env.REACT_APP_URL_API}/users/${id}/subtract-coins`
            : `${process.env.REACT_APP_URL_API}/users/${id}/add-coins`;
  
        const response = await axios.post(
          endpoint,
          { amount: Number(value.coin) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "*/*",
            },
          }
        );
  
        if (response.status === 201) {
          onCanCoin();
          Swal.fire({
            icon: "success",
            title: value.type === "removeCoin" ? "Trừ xu thành công" : "Thêm xu thành công",
            text: "Vui lòng đợi ít phút.",
            timer: 1000,
            timerProgressBar: true,
            customClass: {
              popup: "custom-swal",
              title: "custom-title",
            },
          });
          onRefesh();
        }
      } catch (error) {
        console.error(error);
        return error;
      }
    }
  };
  
  return (
    <Modal title="Thêm/Trừ xu" open={isShowCoin} onCancel={onCanCoin} footer={null}>
      <Form onFinish={handleAppCoin} layout="vertical">
        <Form.Item name="coin" label="Số xu">
          <Input defaultValue={0} />
        </Form.Item>

        <Form.Item name="type" label="Loại xu">
          <Radio.Group defaultValue="addCoin">
            <Radio value="addCoin">Thêm xu</Radio>
            <Radio value="removeCoin">Trừ xu</Radio>
          </Radio.Group>
        </Form.Item>
        <div className="flex justify-end gap-3">
          <Button className="bg-green-500 text-white" htmlType="submit">
            Lưu
          </Button>
          <Button onClick={onCanCoin}>Đóng</Button>
        </div>
      </Form>
    </Modal>
  );

};

export default ModalAppCoin;
