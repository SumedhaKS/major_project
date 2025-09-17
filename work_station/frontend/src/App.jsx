import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import RegisterPatient from "./pages/RegisterPatient";
import UploadImages from "./pages/UploadImages"; // ✅ import added

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route → Signin */}
        <Route path="/" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patient-details" element={<RegisterPatient />} />
        <Route path="/get-images" element={<UploadImages />} /> {/* ✅ new route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
