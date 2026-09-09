import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./router/AppRouter";
import "./styles.css";
import { setAuthToken } from "./api";

// ✅ app start pe token set (so refresh ke baad bhi admin dashboard work kare)
const token = localStorage.getItem("admin_access");
setAuthToken(token);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
