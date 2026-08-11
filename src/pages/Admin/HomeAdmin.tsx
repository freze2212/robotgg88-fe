import HeaderAdmin from "./ManageUser/HeaderAdmin";
import MenuAdmin from "./Menu";
import "./Admin.css";

const HomeAdmin = () => {
  return (
    <div className="admin-shell">
      <HeaderAdmin />
      <MenuAdmin />
    </div>
  );
};

export default HomeAdmin;
