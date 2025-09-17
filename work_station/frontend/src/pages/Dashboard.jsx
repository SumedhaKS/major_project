import { Link } from "react-router-dom";
import Button from "../components/Button";
import "../styles/Dashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [phone, setPhone] = useState("");

  useEffect(()=>{
    async ()=>{
      const response = await axios.get("http://localhost:3000/api/v1/patient/search");
      // logic pending
    }
  }, [phone])
   // logic pending

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
          <Button>Logout</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Welcome to Dental AI</h1>
          <p>Smart diagnostics and patient management at your fingertips.</p>
        </div>
      </section>

      {/* Patient Search Section */}
      <section className="patient-search">
        <h2>Find Patient</h2>
        <div className="search-box">
          <input type="text" placeholder="Enter Phone" onChange={(e)=> setPhone(e.target.value)} />
          <Button>Search</Button>
        </div>
        <p>
          Not found?{" "}
          <Link to="/patient-details">Register New Patient</Link>
        </p>
      </section>

      {/* Services Section */}
      <section className="services">
        <h2>Our Services</h2>
        <div className="service-cards">
          <div className="card">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2921/2921822.png"
              alt="AI Diagnosis"
            />
            <h3>AI Diagnosis</h3>
            <p>Analyze dental images instantly with our AI-powered tools.</p>
          </div>
          <div className="card">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
              alt="Patient Management"
            />
            <h3>Patient Management</h3>
            <p>Register and maintain detailed patient records seamlessly.</p>
          </div>
          <div className="card">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Reports"
            />
            <h3>Reports</h3>
            <p>Access detailed diagnostic reports anytime, anywhere.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
