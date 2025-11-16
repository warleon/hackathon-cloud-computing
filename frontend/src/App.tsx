import { BrowserRouter, Route, Routes } from "react-router";

import LoginPage from "./pages/login";
import ReportPage from "./pages/report";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LoginPage />} path="/" />
        <Route element={<ReportPage />} path="/report" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
