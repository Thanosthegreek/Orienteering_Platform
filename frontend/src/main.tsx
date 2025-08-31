import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import "./index.css";

import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";

/* Toasts */
import { ToastProvider } from "./components/ToastContext";
import Toasts from "./components/Toasts";

/* Pages */
import Home from "./pages/Home";
import PublicRoutes from "./pages/PublicRoutes";
import Mine from "./pages/Mine";
import CreateRoute from "./pages/CreateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RouteDetails from "./pages/RouteDetails";
import DrawBuilder from "./pages/DrawBuilder";

function Layout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: (
      <div style={{ padding: 16 }}>
        <h2>Something went wrong</h2>
        <p>Use the back button or refresh.</p>
      </div>
    ),
    children: [
      { index: true, element: <Home /> },

      { path: "routes", element: <PublicRoutes /> },

      {
        element: <RequireAuth />,
        children: [
          { path: "routes/mine", element: <Mine /> },
          { path: "create", element: <CreateRoute /> },
          { path: "draw", element: <DrawBuilder /> }, // ← builder route
        ],
      },

      { path: "routes/:id", element: <RouteDetails /> },

      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      { path: "*", element: <div style={{ padding: 16 }}>Not found.</div> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
      <Toasts />
    </ToastProvider>
  </React.StrictMode>
);
