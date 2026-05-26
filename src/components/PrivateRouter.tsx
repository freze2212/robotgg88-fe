import React, { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import BackgroundVideo from "./BackgroundVideo";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const Cookies = require("js-cookie");
  const token = Cookies.get("access_token");
  const location = useLocation();

  const userInfoString = localStorage.getItem("user_info");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const role = userInfo?.role;

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (location.pathname.startsWith("/admin") && role === "USER") {
    return <Navigate to="/" replace />;
  }

  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
        {children}
      </div>
    );
  }

  return (
    <>
      <BackgroundVideo />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
        }}
      >
        {children}
      </div>
    </>
  );
};

export default PrivateRoute;
