import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  redirect,
} from "react-router-dom";

import Landing from "../views/Landing";
import AdminLogin from "../views/admin/AdminLogin";
import AdminDashboard from "../views/admin/AdminDashboard";
import { setAuthToken } from "../api";

function requireAdmin() {
  const token = localStorage.getItem("admin_access");
  if (!token) throw redirect("/admin");
  setAuthToken(token);
  return null;
}

const router = createBrowserRouter(
  [
    { path: "/", element: <Landing /> },
    { path: "/admin", element: <AdminLogin /> },
    {
      path: "/admin/dashboard",
      loader: requireAdmin, // ✅ without token redirect to /admin
      element: <AdminDashboard />,
    },
    { path: "*", element: <Navigate to="/" replace /> },
  ],
  {
    // ✅ React Router v7 warnings ko opt-in karke remove
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
