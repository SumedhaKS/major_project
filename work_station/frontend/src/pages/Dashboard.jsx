import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import "../styles/Dashboard.css";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function Dashboard() {
  const [phone, setPhone] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch patients with debounce
  const fetchPatients = useCallback(async (query) => {
    if (!query || query.trim() === "") return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/api/v1/patient/search?phno=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      //console.log("Response data:", response.data);
      const suggestions = response.data.suggestions || [];
      setPatients(suggestions);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (phone) fetchPatients(phone);
    }, 600);
    return () => clearTimeout(handler);
  }, [phone, fetchPatients]);

  const handleSearch = async () => {
    if (phone.trim() === "") return;
    fetchPatients(phone);
  };

  //  Navigate when suggestion is clicked
  const handleSelectPatient = (patientId,name) => {
    navigate(`/patient/${patientId}/${name}`);
  };

  const handleLogout = ()=>{
    localStorage.removeItem("token");
    navigate("/");
    
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">🦷 Dental AI</div>
        <nav className="nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/patient-details">Register Patient</Link>
          <Link to="/reports">Reports</Link>
        </nav>
        <div className="logout">
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-text">
          <h1>Welcome to Dental AI</h1>
          <p>Smart diagnostics and patient management at your fingertips.</p>
        </div>
      </section>

      {/* Patient Search */}
      <section className="patient-search">
        <h2>Find Patient</h2>
        <div className="search-box" style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Enter Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button onClick={handleSearch}>Search</Button>

          {/*  Suggestion dropdown */}
          {patients.length > 0 && (
            <ul className="suggestion-list">
              {patients.map((p) => (
                <li
                  key={p.patientId}
                  className="suggestion-item"
                  onClick={() => handleSelectPatient(p.patientId,p.name)}
                >
                  {p.name} ({p.patientId})
                </li>
              ))}
            </ul>
          )}
        </div>

        {loading && <p>Searching...</p>}

        <p>
          Not found? <Link to="/patient-details">Register New Patient</Link>
        </p>
      </section>

      {/* Services */}
      <section className="services">
        <h2>Our Services</h2>
        <div className="service-cards">
          <div className="card">
            <img src="https://cdn-icons-png.flaticon.com/512/2921/2921822.png" alt="AI Diagnosis" />
            <h3>AI Diagnosis</h3>
            <p>Analyze dental images instantly with our AI-powered tools.</p>
          </div>
          <div className="card">
            <img src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="Patient Management" />
            <h3>Patient Management</h3>
            <p>Register and maintain detailed patient records seamlessly.</p>
          </div>
          <div className="card">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Reports" />
            <h3>Reports</h3>
            <p>Access detailed diagnostic reports anytime, anywhere.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
