import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import {
  ProtectedLayout,
  RoleGuard,
} from "@/components/layout/protected-layout";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { queryClient } from "@/lib/query-client";
import LoginPage from "@/pages/login";
import ReportPage from "@/pages/report";
import ReportsDashboardPage from "@/pages/reports-dashboard";
import AdminCreateUserPage from "@/pages/admin-create-user";
import AdminUsersListPage from "@/pages/admin-users-list";
import AdminEditUserPage from "@/pages/admin-edit-user";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-sky-400">
            <Routes>
              <Route element={<LoginPage />} path="/" />
              <Route element={<ProtectedLayout />}>
                <Route element={<ReportsDashboardPage />} path="/reports" />
                <Route element={<ReportPage />} path="/report" />
                <Route
                  element={
                    <RoleGuard roles={["admin"]}>
                      <AdminUsersListPage />
                    </RoleGuard>
                  }
                  path="/admin/users"
                />
                <Route
                  element={
                    <RoleGuard roles={["admin"]}>
                      <AdminCreateUserPage />
                    </RoleGuard>
                  }
                  path="/admin/users/create"
                />
                <Route
                  element={
                    <RoleGuard roles={["admin"]}>
                      <AdminEditUserPage />
                    </RoleGuard>
                  }
                  path="/admin/users/:userId/edit"
                />
              </Route>
              <Route element={<Navigate replace to="/reports" />} path="*" />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
