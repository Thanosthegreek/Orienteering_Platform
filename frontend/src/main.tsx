import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import "./index.css";

import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";

import Home from "./pages/Home";
import PublicRoutes from "./pages/PublicRoutes";
import Mine from "./pages/Mine";
import CreateRoute from "./pages/CreateRoute";
import Login from "./pages/Login";
import RouteDetails from "./pages/RouteDetails";

function Layout() {
  return (
    <div style={{ padding: 16 }}>
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
      // Home
      { index: true, element: <Home /> },

      // Public list is at /routes
      { path: "routes", element: <PublicRoutes /> },

      // Protected pages
      {
        element: <RequireAuth />,
        children: [
          { path: "routes/mine", element: <Mine /> },
          { path: "create", element: <CreateRoute /> },
        ],
      },

      // Route details
      { path: "routes/:id", element: <RouteDetails /> },

      // Auth
      { path: "login", element: <Login /> },

      // --- Optional back-compat redirects (old paths) ---
      { path: "public", element: <Navigate to="/routes" replace /> },
      { path: "mine", element: <Navigate to="/routes/mine" replace /> },

      // 404
      { path: "*", element: <div style={{ padding: 16 }}>Not found.</div> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
