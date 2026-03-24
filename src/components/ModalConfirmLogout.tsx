import React from "react";

interface IProps {
  isShowLogout: boolean;
  setIsShowLogout: () => void;
}

const ModalConfirmLogout: React.FC<IProps> = ({
  isShowLogout,
  setIsShowLogout,
}) => {
  const Cookies = require("js-cookie");

  return (
    <div className={`model-group ${isShowLogout ? "active" : ""} `}>
      <div
        id="logout-model "
        className={`model-item model-logout ${
          isShowLogout ? "model-logout_active" : ""
        } `}
        style={{
          color: "rgb(255, 255, 255)",
          fontFamily: "Prompt",
          boxSizing: "border-box",
          padding: "40px 0px",
          width: "calc(-35px + 100vw)",
          position: "relative",
          maxWidth: "500px",
          backgroundImage: 'url("/assets/modal-login.png")',
          backgroundSize: "100% 100%",
          display: "block",
          font: "16px / 24px Prompt",
        }}
      >
        <div
          className="btn-closeModel"
          onClick={setIsShowLogout}
          style={{
            color: "rgb(255, 255, 255)",
            fontFamily: "Prompt",
            boxSizing: "border-box",
            backgroundPosition: "center center",
            position: "absolute",
            top: "0px",
            right: "0px",
            width: "35px",
            height: "35px",
            marginLeft: "auto",
            backgroundImage:
              'url("https://trumcasino6789.com/images/close_bt.png")',
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            cursor: "pointer",
          }}
        />
        <div
          className="wrapper text-center"
          style={{
            color: "rgb(255, 255, 255)",
            fontFamily: "Prompt",
            boxSizing: "border-box",
            padding: "20px",
            border: "unset",
            backgroundColor: "unset",
            textAlign: "center",
          }}
        >
          <div
            className="title"
            style={{
              color: "rgb(255, 255, 255)",
              fontFamily: "Prompt",
              boxSizing: "border-box",
            }}
          >
            <h1
              style={{
                fontFamily: "Prompt",
                boxSizing: "border-box",
                lineHeight: 1.2,
                clear: "both",
                fontWeight: 600,
                marginTop: "24px",
                marginBottom: "15px",
                paddingBottom: "10px",
                color: "rgb(255, 255, 255)",
                fontSize: "32px",
              }}
            >
              Đăng xuất
            </h1>
            <h3
              style={{
                boxSizing: "border-box",
                clear: "both",
                fontFamily: "Kanit-Light",
                color: "rgb(255, 255, 255)",
                lineHeight: 1.2,
                fontWeight: 500,
                marginTop: "0px",
                marginBottom: "0px",
                fontSize: "26px",
              }}
            >
              Bạn có chắc muốn đăng xuất không?
            </h3>
          </div>
          <form
            style={{
              color: "rgb(255, 255, 255)",
              fontFamily: "Prompt",
              boxSizing: "border-box",
            }}
          >
            <div
              className="group-btn mt-4"
              style={{
                color: "rgb(255, 255, 255)",
                fontFamily: "Prompt",
                boxSizing: "border-box",
                textAlign: "center",
                left: "0px",
                width: "100%",
                position: "relative",
                marginTop: "1.5rem",
              }}
            >
              <button
                className="btn-cancel"
                onClick={setIsShowLogout}
                type="button"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  Cookies.remove("access_token");
                  setIsShowLogout();
                  window.location.reload();
                  localStorage.removeItem("user_info");
                }}
                className="btn-confirm"
                type="button"
              >
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
html {
  color: rgb(255, 255, 255);
  box-sizing: border-box;
  font-family: sans-serif;
  line-height: 1.15;
  text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}

body {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: rgb(33, 37, 41);
  text-align: left;
  margin: 0px;
  -webkit-font-smoothing: auto;
  background-color: transparent;
}
`,
        }}
      />
    </div>
  );
};

export default ModalConfirmLogout;
