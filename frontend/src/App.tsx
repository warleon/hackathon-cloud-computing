import { BrowserRouter, Route, Routes } from "react-router";

import LoginPage from "./pages/login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LoginPage />} path="/" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
