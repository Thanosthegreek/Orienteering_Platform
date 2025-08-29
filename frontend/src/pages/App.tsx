// frontend/src/pages/App.tsx
import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import PublicRoutes from "./PublicRoutes";
import Mine from "./Mine";
import CreateRoute from "./CreateRoute";
import RouteDetails from "./RouteDetails";

import RequireAuth from "../components/RequireAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/routes" element={<PublicRoutes />} />

      {/* ✅ IMPORTANT: put /routes/mine BEFORE /routes/:id so "mine" does not match as an :id */}
      <Route
        path="/routes/mine"
        element={
          <RequireAuth>
            <Mine />
          </RequireAuth>
        }
      />

      {/* Details route must come AFTER /routes/mine */}
      <Route path="/routes/:id" element={<RouteDetails />} />

      <Route
        path="/create"
        element={
          <RequireAuth>
            <CreateRoute />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
