import { BrowserRouter, Route, Routes } from "react-router";

import LoginPage from "./pages/login";
import ReportPage from "./pages/report";
import ReportsDashboardPage from "./pages/reports-dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LoginPage />} path="/" />
        <Route element={<ReportPage />} path="/report" />
        <Route element={<ReportsDashboardPage />} path="/reports" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
