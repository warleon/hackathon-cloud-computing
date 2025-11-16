import { BrowserRouter, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/login";
import ReportPage from "./pages/report";
import ReportsDashboardPage from "./pages/reports-dashboard";
import AdminCreateUserPage from "./pages/admin-create-user";
import AdminUsersListPage from "./pages/admin-users-list";
import AdminEditUserPage from "./pages/admin-edit-user";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LoginPage />} path="/" />
        <Route element={<ReportPage />} path="/report" />
        <Route element={<ReportsDashboardPage />} path="/reports" />
        <Route element={<AdminUsersListPage />} path="/admin/users" />
        <Route element={<AdminCreateUserPage />} path="/admin/users/create" />
        <Route
          element={<AdminEditUserPage />}
          path="/admin/users/:userId/edit"
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
