import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/hompage/HomePage";
import PrivateRoute from "../components/PrivateRouter";
import HomeAdmin from "../pages/Admin/HomeAdmin";
import Login from "../pages/login/Login";
import HomeCasino from "../pages/casino/HomeCasino";
import BaccaratRoomList from "../pages/casino/LobbyCasino";
import LobbyRoom from "../pages/casino/LobbyRoom";
import CandleChart from "../pages/casino/chart/CandleChart";

import HomeNH from "../pages/NH/HomeNH";
import SlotNH from "../pages/NH/Slot";
import TableGame from "../pages/NH/TableGame";

const Approuter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/casino" element={<HomeCasino />} />
              <Route path="/admin" element={<HomeAdmin />} />
              <Route path="/casino/:id" element={<BaccaratRoomList />} />
              <Route path="/casino/room/:id" element={<LobbyRoom />} />
              <Route path="/chart" element={<CandleChart />} />

              <Route path="/NH" element={<HomeNH />} />
              <Route path="/NH/slot/:room" element={<SlotNH />} />
              <Route path="/NH/table/:room" element={<TableGame />} />
            </Routes>
          </PrivateRoute>
        }
      />

    </Routes>
  );
};

export default Approuter;
